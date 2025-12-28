import { prisma } from './prisma'
import { calculateLevel } from './game-logic'
import { getAchievementsCatalog, getCatalogMap } from './achievements-catalog'

export interface AchievementUnlock {
  achievementId: string
  name: string
  description: string
  xpBonus: number
  icon: string
}

let catalogSeeded = false

async function ensureAchievementsSeeded() {
  if (catalogSeeded) return

  const catalog = getAchievementsCatalog()
  const domains = await prisma.domain.findMany({ select: { id: true, name: true } })
  const domainMap = new Map(domains.map((d) => [d.name, d.id]))

  await Promise.all(
    catalog.map(async (ach) => {
      const domainId = ach.type === 'domain_specific' ? domainMap.get(ach.domainName || '') ?? null : null

      await prisma.achievement.upsert({
        where: { id: ach.id },
        update: {
          name: ach.name,
          description: ach.description,
          domainId,
          xpBonus: ach.xpBonus,
          type: ach.type,
          requirements: { ...ach.requirements, grade: ach.grade, difficulty: ach.difficulty },
          icon: ach.icon,
          isActive: true,
        },
        create: {
          id: ach.id,
          name: ach.name,
          description: ach.description,
          domainId,
          xpBonus: ach.xpBonus,
          type: ach.type,
          requirements: { ...ach.requirements, grade: ach.grade, difficulty: ach.difficulty },
          icon: ach.icon,
          isActive: true,
        },
      })
    })
  )

  catalogSeeded = true
}

/**
 * Check for newly unlocked achievements after a task completion
 */
export async function checkAchievements(userId: string, taskId: string): Promise<AchievementUnlock[]> {
  const unlockedAchievements: AchievementUnlock[] = []

  await ensureAchievementsSeeded()

  // Get user progress and stats
  const [user, progress, completedTasks, domainTaskTemplates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true }
    }),
    prisma.userProgress.findUnique({
      where: { userId }
    }),
    prisma.task.count({
      where: {
        userId,
        status: 'completed',
        result: 'success'
      }
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: 'completed',
        result: 'success'
      },
      select: {
        template: {
          select: { domainId: true }
        }
      }
    })
  ])

  if (!user || !progress) return []

  const existingAchievementIds = user.achievements.map((ua: any) => ua.achievementId)

  // Get all achievements that aren't unlocked yet
  const availableAchievements = await prisma.achievement.findMany({
    where: {
      isActive: true,
      id: { notIn: existingAchievementIds }
    }
  })

  const catalogMap = getCatalogMap()

  const domainTaskCounts = domainTaskTemplates.reduce<Map<string, number>>((acc, task) => {
    const domainId = task.template?.domainId
    if (!domainId) return acc
    acc.set(domainId, (acc.get(domainId) ?? 0) + 1)
    return acc
  }, new Map())

  const currentStreakValue = Math.max(progress.currentStreak, progress.longestStreak)

  for (const achievement of availableAchievements) {
    let isUnlocked = false

    try {
      const requirements = achievement.requirements as any
      const catalogEntry = catalogMap.get(achievement.id)
      const reqType = requirements?.type

      switch (reqType) {
        case 'completedTasks':
          isUnlocked = completedTasks >= (requirements.count ?? 0)
          break
        case 'streak':
          isUnlocked = currentStreakValue >= (requirements.minStreak ?? 0)
          break
        case 'level':
          isUnlocked = progress.currentLevel >= (requirements.minLevel ?? 0)
          break
        case 'domainTasks': {
          const domainId = achievement.domainId
          const minDomainTasks = requirements.minDomainTasks ?? requirements.count ?? 0
          if (domainId) {
            const count = domainTaskCounts.get(domainId) ?? 0
            isUnlocked = count >= minDomainTasks
          }
          break
        }
        default:
          isUnlocked = false
      }

      if (isUnlocked) {
        // Unlock the achievement
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          }
        })

        // Award XP bonus if applicable
        const xpBonus = catalogEntry?.xpBonus ?? achievement.xpBonus

        if (xpBonus > 0) {
          const newXp = progress.totalXpEarned + xpBonus
          const levelInfo = calculateLevel(newXp)

          await prisma.userProgress.update({
            where: { userId },
            data: {
              totalXpEarned: newXp,
              currentXp: levelInfo.currentXp,
              currentLevel: levelInfo.level,
            }
          })
        }

        unlockedAchievements.push({
          achievementId: achievement.id,
          name: achievement.name,
          description: achievement.description,
          xpBonus: xpBonus ?? 0,
          icon: catalogEntry?.icon ?? achievement.icon,
        })
      }
    } catch (error) {
      console.error(`Error checking achievement ${achievement.id}:`, error)
    }
  }

  return unlockedAchievements
}

export { ensureAchievementsSeeded }
