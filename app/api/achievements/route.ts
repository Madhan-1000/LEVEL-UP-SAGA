import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { ensureAchievementsSeeded } from '@/lib/achievement-engine'
import { getCatalogMap } from '@/lib/achievements-catalog'

// GET /api/achievements - Get user's achievements
export async function GET(request: NextRequest) {
  try {
    await ensureAchievementsSeeded()

    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json([], { status: 200 })

    // SYNC USER FIRST
    await fetch(`${request.nextUrl.origin}/api/users`, { 
      headers: { cookie: request.headers.get('cookie') || '' }
    })

    const { userId: authUserId } = await auth()
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeLocked = searchParams.get('includeLocked') === 'true'

    const user = await prisma.user.findUnique({
      where: { clerkId: authUserId },
      include: {
        achievements: {
          include: {
            achievement: {
              include: {
                domain: true
              }
            }
          }
        },
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

    const unlockedAchievementIds = user.achievements.map((ua: any) => ua.achievement.id)

    const catalogMap = getCatalogMap()
    let allAchievements: any[] = []

    if (includeLocked) {
      // Get all achievements with unlock status
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        include: { domain: true },
        orderBy: { createdAt: 'asc' }
      })

      allAchievements = achievements.map((achievement: any) => {
        const meta = catalogMap.get(achievement.id)
        return {
          ...achievement,
          grade: meta?.grade ?? achievement.requirements?.grade ?? 'bronze',
          difficulty: meta?.difficulty ?? achievement.requirements?.difficulty ?? 'easy',
          isUnlocked: unlockedAchievementIds.includes(achievement.id),
          unlockedAt: user.achievements.find((ua: any) => ua.achievementId === achievement.id)?.unlockedAt || null
        }
      })
    } else {
      // Only return unlocked achievements
      allAchievements = user.achievements.map((ua: any) => {
        const meta = catalogMap.get(ua.achievementId)
        return {
          ...ua.achievement,
          grade: meta?.grade ?? ua.achievement.requirements?.grade ?? 'bronze',
          difficulty: meta?.difficulty ?? ua.achievement.requirements?.difficulty ?? 'easy',
          isUnlocked: true,
          unlockedAt: ua.unlockedAt
        }
      })
    }

    // Calculate achievement stats
    const stats = {
      total: allAchievements.length,
      unlocked: unlockedAchievementIds.length,
      locked: allAchievements.length - unlockedAchievementIds.length,
      byType: {
        general: allAchievements.filter((a: any) => a.type === 'general' && a.isUnlocked).length,
        domain_specific: allAchievements.filter((a: any) => a.type === 'domain_specific' && a.isUnlocked).length,
        level_based: allAchievements.filter((a: any) => a.type === 'level_based' && a.isUnlocked).length,
        streak_based: allAchievements.filter((a: any) => a.type === 'streak_based' && a.isUnlocked).length,
      }
    }

    return NextResponse.json({
      achievements: allAchievements,
      stats
    })

  } catch (error) {
    console.error('GET /api/achievements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
