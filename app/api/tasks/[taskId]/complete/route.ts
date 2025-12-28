import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { completeTaskSchema } from "@/lib/validations"
import { calculateLevel, getTaskXpReward } from "@/lib/game-logic"
import {
  detectCheating,
  getCheatingConsequences,
  logCheatingDetection,
} from "@/lib/cheating-detection"
import { checkAchievements } from "@/lib/achievement-engine"
function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// POST /api/tasks/[taskId]/complete - Complete a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // IMPORTANT: taskId must come from route params
    const { taskId } = await params

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "Invalid taskId" }, { status: 400 })
    }

    // If you ever see this, it means the CLIENT is still building the URL wrong.
    if (taskId === "[object Object]" || taskId.includes("object%20Object")) {
      return NextResponse.json(
        { error: "Invalid taskId in URL (client passed an object instead of string id)." },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))

    // Make validation independent of whether client sends taskId in body
    const validationResult = completeTaskSchema.safeParse({
      ...body,
      taskId, // override/ensure taskId is the route param
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { completedAt, userRating, reviewNotes } = validationResult.data

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get task with template
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        template: {
          include: {
            domain: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.userId !== user.id) {
      return NextResponse.json({ error: "Task not owned by user" }, { status: 403 })
    }

    if (task.status === "completed") {
      return NextResponse.json({ error: "Task already completed" }, { status: 400 })
    }

    // Calculate completion time
    const startedAt = task.startedAt || task.assignedAt
    const completionTime = completedAt ? new Date(completedAt) : new Date()
    const completionSpeed = Math.floor(
      (completionTime.getTime() - startedAt.getTime()) / 1000
    )

    // Anti-cheat detection (recent tasks in last minute)
    const recentTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: new Date(Date.now() - 60_000),
          lte: new Date(),
        },
      },
      select: {
        completedAt: true,
        completionSpeed: true,
        result: true,
      },
    })

    const cheatDetection = detectCheating(
      recentTasks.map((t: any) => ({
        completedAt: t.completedAt!,
        completionSpeed: t.completionSpeed || undefined,
        result: t.result || undefined,
      })),
      completionSpeed
    )

    let taskResult: "success" | "failure" | "timeout" | "cheated" = "success"
    let awardedXp = 0
    let isCheated = false

    if (cheatDetection.isCheating) {
      const consequences = getCheatingConsequences(cheatDetection.severity)
      taskResult = consequences.taskResult as any
      awardedXp = consequences.xpPenalty
      isCheated = true

      await logCheatingDetection(userId, taskId, cheatDetection, {
        recentTasks: recentTasks.length,
        completionSpeed,
        userAgent: request.headers.get("user-agent") || undefined,
      })
    } else {
      awardedXp = getTaskXpReward(task.template.taskType, task.template.difficulty)
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: isCheated ? "cheated" : "completed",
        completedAt: completionTime,
        result: taskResult,
        completionSpeed,
        flaggedAsCheat: isCheated,
        userRating,
        reviewNotes,
      },
      include: {
        template: {
          include: {
            domain: true,
          },
        },
      },
    })

    // Log to timeline (best-effort; does not block the response)
    const timelineDay = startOfUtcDay(completionTime)
    prisma.timelineEntry
      .create({
        data: {
          userId: user.id,
          day: timelineDay,
          occurredAt: completionTime,
          title: `Task completed: ${task.template.name}`,
          description: task.template.description,
          kind: "task",
        },
      })
      .catch((err) => {
        console.error("timelineEntry create failed", err)
      })

    let levelUp: null | { newLevel: number; title: string; xpGained: number } = null

    // Update user progress (only if not cheated)
    if (!isCheated && awardedXp > 0) {
      const progress = await prisma.userProgress.findUnique({
        where: { userId: user.id },
      })

      if (progress) {
        const newXp = progress.totalXpEarned + awardedXp
        const levelInfo = calculateLevel(newXp)

        await prisma.userProgress.update({
          where: { userId: user.id },
          data: {
            currentXp: levelInfo.currentXp,
            totalXpEarned: newXp,
            currentLevel: levelInfo.level,
            lastActivityAt: new Date(),
          },
        })

        if (levelInfo.level > progress.currentLevel) {
          levelUp = {
            newLevel: levelInfo.level,
            title: levelInfo.title,
            xpGained: awardedXp,
          }
        }
      }
    }

    // Check for achievements
    const newAchievements = await checkAchievements(user.id, taskId)

    return NextResponse.json({
      task: updatedTask,
      xpAwarded: awardedXp,
      levelUp,
      newAchievements,
      cheatDetected: isCheated ? cheatDetection : null,
    })
  } catch (error) {
    console.error("POST /api/tasks/[taskId]/complete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
