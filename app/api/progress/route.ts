// app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProgressSchema } from '@/lib/validations';
import { calculateLevel } from '@/lib/game-logic';
import { auth } from "@clerk/nextjs/server"; 
// GET /api/progress - Get user progress
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SYNC USER FIRST
    await fetch(`${request.nextUrl.origin}/api/users`, { 
      headers: { cookie: request.headers.get('cookie') || '' }
    })

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        progress: true,
        domains: {
          include: {
            domain: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate current level info
    const progress = user.progress
    let levelInfo = null

    if (progress) {
      levelInfo = calculateLevel(progress.totalXpEarned)
    }

    // Get recent tasks for streak calculation
    const recentTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        status: 'completed',
        result: 'success'
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    })

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const task of recentTasks) {
      if (!task.completedAt) continue

      const taskDate = new Date(task.completedAt)
      taskDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === currentStreak) {
        currentStreak++
      } else if (daysDiff > currentStreak) {
        break
      }
    }

    // Update streak if it has changed
    if (progress && progress.currentStreak !== currentStreak) {
      await prisma.userProgress.update({
        where: { userId: user.id },
        data: {
          currentStreak,
          longestStreak: Math.max(progress.longestStreak, currentStreak)
        }
      })
      progress.currentStreak = currentStreak
      progress.longestStreak = Math.max(progress.longestStreak, currentStreak)
    }

    return NextResponse.json({
      progress,
      levelInfo,
      domains: user.domains.map((ud: any) => ud.domain),
      currentStreak,
    })

  } catch (error) {
    console.error('GET /api/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/progress - Update user progress
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = updateProgressSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create progress record
    let progress = await prisma.userProgress.findUnique({
      where: { userId: user.id }
    })

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: user.id,
          ...updateData
        }
      })
    } else {
      progress = await prisma.userProgress.update({
        where: { userId: user.id },
        data: updateData
      })
    }

    // Recalculate level if XP changed
    let levelInfo = null
    if (updateData.currentXp !== undefined || progress.totalXpEarned > 0) {
      const totalXp = progress.totalXpEarned
      levelInfo = calculateLevel(totalXp)

      // Update level if it changed
      if (levelInfo.level !== progress.currentLevel) {
        progress = await prisma.userProgress.update({
          where: { userId: user.id },
          data: {
            currentLevel: levelInfo.level,
            currentXp: levelInfo.currentXp
          }
        })
      }
    }

    return NextResponse.json({
      progress,
      levelInfo
    })

  } catch (error) {
    console.error('PUT /api/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
