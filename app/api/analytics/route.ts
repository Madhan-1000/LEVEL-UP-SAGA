import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics - Get user analytics and insights
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d

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

    if (!user || !user.progress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get task analytics
    const taskStats = await getTaskAnalytics(user.id, startDate)
    const domainStats = await getDomainAnalytics(user.id, startDate)
    const streakStats = await getStreakAnalytics(user.id, startDate)
    const achievementStats = await getAchievementAnalytics(user.id)

    // Generate insights
    const insights = generateInsights({
      taskStats,
      domainStats,
      streakStats,
      achievementStats,
      timeframe
    })

    return NextResponse.json({
      timeframe,
      stats: {
        tasks: taskStats,
        domains: domainStats,
        streaks: streakStats,
        achievements: achievementStats
      },
      insights,
      user: {
        level: user.progress.currentLevel,
        totalXp: user.progress.totalXpEarned,
        domains: user.domains.length
      }
    })

  } catch (error) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getTaskAnalytics(userId: string, startDate: Date) {
  const [totalTasks, completedTasks, failedTasks, cheatedTasks] = await Promise.all([
    prisma.task.count({
      where: { userId, assignedAt: { gte: startDate } }
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'completed',
        result: 'success',
        completedAt: { gte: startDate }
      }
    }),
    prisma.task.count({
      where: {
        userId,
        status: { in: ['failed', 'cheated'] },
        completedAt: { gte: startDate }
      }
    }),
    prisma.task.count({
      where: {
        userId,
        flaggedAsCheat: true,
        completedAt: { gte: startDate }
      }
    })
  ])

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Daily breakdown
  const dailyStats = await prisma.$queryRaw`
    SELECT
      DATE(completed_at) as date,
      COUNT(*) as total,
      SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN flagged_as_cheat = true THEN 1 ELSE 0 END) as cheated
    FROM tasks
    WHERE user_id = ${userId}
      AND completed_at >= ${startDate}
      AND status = 'completed'
    GROUP BY DATE(completed_at)
    ORDER BY date DESC
  `

  return {
    total: totalTasks,
    completed: completedTasks,
    failed: failedTasks,
    cheated: cheatedTasks,
    completionRate,
    dailyBreakdown: dailyStats
  }
}

async function getDomainAnalytics(userId: string, startDate: Date) {
  // Get completed tasks with domain info
  const taskCompletions = await prisma.task.findMany({
    where: {
      userId,
      status: 'completed',
      result: 'success',
      completedAt: { gte: startDate }
    },
    include: {
      template: {
        include: {
          domain: true
        }
      }
    }
  })

  // Get domain names
  const domainMap = new Map()
  for (const task of taskCompletions) {
    const domainName = task.template.domain.name
    domainMap.set(domainName, (domainMap.get(domainName) || 0) + 1)
  }

  const sortedDomains = Array.from(domainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => ({ domain, count }))

  return {
    breakdown: sortedDomains,
    topDomain: sortedDomains[0]?.domain || null,
    totalDomains: sortedDomains.length
  }
}

async function getStreakAnalytics(userId: string, startDate: Date) {
  const progress = await prisma.userProgress.findUnique({
    where: { userId }
  })

  if (!progress) return { current: 0, longest: 0, average: 0 }

  // Calculate average streak from reviews
  const reviews = await prisma.dailyReview.findMany({
    where: {
      userId,
      date: { gte: startDate }
    },
    select: {
      tasksCompleted: true,
      tasksFailed: true
    }
  })

  const totalTasks = reviews.reduce((sum: number, r: any) => sum + r.tasksCompleted + r.tasksFailed, 0)
  const completionRate = totalTasks > 0 ?
    reviews.reduce((sum: number, r: any) => sum + r.tasksCompleted, 0) / totalTasks : 0

  return {
    current: progress.currentStreak,
    longest: progress.longestStreak,
    averageCompletionRate: Math.round(completionRate * 100),
    reviewConsistency: reviews.length > 0 ? Math.round((reviews.length / 30) * 100) : 0 // Assuming 30-day period
  }
}

async function getAchievementAnalytics(userId: string) {
  const [totalAchievements, unlockedAchievements] = await Promise.all([
    prisma.achievement.count({ where: { isActive: true } }),
    prisma.userAchievement.count({ where: { userId } })
  ])

  // Recent unlocks (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentUnlocks = await prisma.userAchievement.count({
    where: {
      userId,
      unlockedAt: { gte: thirtyDaysAgo }
    }
  })

  return {
    total: totalAchievements,
    unlocked: unlockedAchievements,
    locked: totalAchievements - unlockedAchievements,
    recentUnlocks,
    unlockRate: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0
  }
}

function generateInsights(data: any) {
  const insights = []

  // Task completion insights
  if (data.taskStats.completionRate < 50) {
    insights.push({
      type: 'warning',
      title: 'Low Completion Rate',
      message: `Your task completion rate is ${data.taskStats.completionRate}%. Try breaking tasks into smaller steps.`,
      suggestion: 'Consider starting with easier tasks to build momentum.'
    })
  } else if (data.taskStats.completionRate > 80) {
    insights.push({
      type: 'success',
      title: 'Excellent Progress!',
      message: `You're completing ${data.taskStats.completionRate}% of your tasks. Keep up the great work!`,
      suggestion: 'Consider increasing difficulty for more challenge.'
    })
  }

  // Domain balance insights
  if (data.domainStats.breakdown.length > 1) {
    const topDomain = data.domainStats.breakdown[0]
    const totalTasks = data.domainStats.breakdown.reduce((sum: number, d: any) => sum + d.count, 0)
    const topDomainPercentage = Math.round((topDomain.count / totalTasks) * 100)

    if (topDomainPercentage > 70) {
      insights.push({
        type: 'info',
        title: 'Domain Imbalance',
        message: `${topDomainPercentage}% of your tasks are in ${topDomain.domain}. Consider balancing across domains.`,
        suggestion: 'Try focusing on your weaker domains for better overall growth.'
      })
    }
  }

  // Streak insights
  if (data.stats.streaks.current === 0 && data.stats.streaks.longest > 0) {
    insights.push({
      type: 'motivation',
      title: 'Restart Your Streak',
      message: `Your longest streak was ${data.stats.streaks.longest} days. You can do it again!`,
      suggestion: 'Start small - complete just one task today to begin rebuilding.'
    })
  }

  // Achievement insights
  if (data.stats.achievements.recentUnlocks === 0) {
    insights.push({
      type: 'goal',
      title: 'Achievement Opportunity',
      message: 'You have achievements waiting to be unlocked!',
      suggestion: 'Check your progress and see what goals you can reach.'
    })
  }

  return insights
}
