// app/api/tasks/assign/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-service";
import { assignTasksToUser, shouldAssignNewTasks } from "@/lib/task-assignment";
import { calculateLevel } from "@/lib/game-logic";

export async function POST() {
  try {
    const clerkId = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser(); // returns DB user row
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Expire any previous-day pending/active tasks and apply XP penalties
    const overdue = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: { in: ["pending", "active"] },
        assignedAt: { lt: today },
      },
      include: { template: true },
    });

    if (overdue.length) {
      const penalty = overdue.reduce((sum, task) => {
        // Penalize half the reward (rounded up) per missed task
        const loss = Math.ceil((task.template?.xpReward ?? 0) * 0.5) || 5;
        return sum + loss;
      }, 0);

      await prisma.$transaction(async (tx) => {
        await tx.task.updateMany({
          where: { id: { in: overdue.map((t) => t.id) } },
          data: {
            status: "failed",
            result: "failure",
            completedAt: new Date(),
          },
        });

        if (penalty > 0) {
          const progress = await tx.userProgress.findUnique({ where: { userId: user.id } });
          if (progress) {
            const newTotal = Math.max(0, progress.totalXpEarned - penalty);
            const levelInfo = calculateLevel(newTotal);

            await tx.userProgress.update({
              where: { userId: user.id },
              data: {
                totalXpEarned: newTotal,
                currentXp: levelInfo.currentXp,
                currentLevel: levelInfo.level,
                lastActivityAt: new Date(),
              },
            });
          }
        }
      });
    }

    // Check today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        assignedAt: { gte: today, lt: tomorrow },
      },
      select: { status: true },
    });

    if (todayTasks.length > 0) {
      const completedCount = todayTasks.filter((t) => t.status === "completed").length;
      if (completedCount === todayTasks.length) {
        return NextResponse.json({ message: "All tasks for today are completed.", assigned: [] });
      }
      return NextResponse.json({ message: "Tasks already assigned for today.", assigned: [] }, { status: 400 });
    }

    const needsTasks = await shouldAssignNewTasks(user.id); // ✅ DB id
    if (!needsTasks) {
      return NextResponse.json({ message: "User already has sufficient active tasks.", assigned: [] });
    }

    const assigned = await assignTasksToUser(user.id); // ✅ DB id
    return NextResponse.json({ message: `Assigned ${assigned.length} new tasks`, assigned });
  } catch (error) {
    console.error("POST /api/tasks/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
