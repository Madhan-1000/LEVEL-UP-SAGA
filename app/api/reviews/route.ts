import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createReviewSchema, updateReviewSchema } from '@/lib/validations'

// GET /api/reviews - Get user's reviews
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const reviews = await prisma.dailyReview.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.dailyReview.count({
      where: { userId: user.id }
    })

    // Calculate review statistics
    const stats = await calculateReviewStats(user.id)

    return NextResponse.json({
      reviews,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create daily review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = createReviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const reviewData = validationResult.data

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if review already exists for this date
    const existingReview = await prisma.dailyReview.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(reviewData.date)
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this date' },
        { status: 409 }
      )
    }

    // Get task stats for the day
    const dayStart = new Date(reviewData.date)
    const dayEnd = new Date(reviewData.date)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const [completedTasks, failedTasks] = await Promise.all([
      prisma.task.count({
        where: {
          userId: user.id,
          status: 'completed',
          result: 'success',
          completedAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      }),
      prisma.task.count({
        where: {
          userId: user.id,
          status: { in: ['failed', 'cheated'] },
          completedAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      })
    ])

    // Override provided stats with actual data
    const review = await prisma.dailyReview.create({
      data: {
        userId: user.id,
        date: new Date(reviewData.date),
        overallSatisfaction: reviewData.overallSatisfaction,
        tasksCompleted: completedTasks,
        tasksFailed: failedTasks,
        reflectionNotes: reviewData.reflectionNotes,
      }
    })

    return NextResponse.json(review, { status: 201 })

  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculateReviewStats(userId: string) {
  const reviews = await prisma.dailyReview.findMany({
    where: { userId },
    select: {
      overallSatisfaction: true,
      tasksCompleted: true,
      tasksFailed: true,
      hoursFocused: true,
      date: true
    }
  })

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageSatisfaction: 0,
      totalTasksCompleted: 0,
      totalTasksFailed: 0,
      completionRate: 0,
      streakDays: 0
    }
  }

  const totalSatisfaction = reviews.reduce((sum: number, r: any) => sum + r.overallSatisfaction, 0)
  const totalCompleted = reviews.reduce((sum: number, r: any) => sum + r.tasksCompleted, 0)
  const totalFailed = reviews.reduce((sum: number, r: any) => sum + r.tasksFailed, 0)
  const totalTasks = totalCompleted + totalFailed

  // Calculate streak (consecutive days with reviews)
  let streakDays = 0
  const sortedDates = reviews
    .map((r: any) => r.date)
    .sort((a: any, b: any) => b.getTime() - a.getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const date of sortedDates) {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streakDays) {
      streakDays++
    } else {
      break
    }
  }

  return {
    totalReviews: reviews.length,
    averageSatisfaction: Math.round((totalSatisfaction / reviews.length) * 10) / 10,
    totalTasksCompleted: totalCompleted,
    totalTasksFailed: totalFailed,
    completionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    streakDays
  }
}
