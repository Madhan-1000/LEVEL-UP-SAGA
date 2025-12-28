import rawLevels from "@/config/levels.json"

// Using string literals for enums to avoid import issues

// ============================================================================
// LEVEL SYSTEM
// ============================================================================

export interface LevelInfo {
  level: number
  xpRequired: number
  title: string
  totalXpRequired: number
}

// Build LevelInfo from config so titles match their rank
type RawLevel = { level: number; xpRequired: number; title: string }
const sortedLevels = (rawLevels as RawLevel[]).slice().sort((a, b) => a.level - b.level)
let runningTotal = 0
export const LEVELS: LevelInfo[] = sortedLevels.map((lvl) => {
  runningTotal += lvl.xpRequired
  return {
    level: lvl.level,
    xpRequired: lvl.xpRequired,
    title: lvl.title,
    totalXpRequired: runningTotal,
  }
})

export function calculateLevel(totalXp: number): { level: number; currentXp: number; xpToNext: number; title: string } {
  let currentLevel = 1
  let xpAccumulated = 0

  for (const levelInfo of LEVELS) {
    if (totalXp >= levelInfo.totalXpRequired) {
      currentLevel = levelInfo.level
      xpAccumulated = levelInfo.totalXpRequired
    } else {
      break
    }
  }

  const currentXpInLevel = totalXp - xpAccumulated
  const nextLevelInfo = LEVELS.find(l => l.level === currentLevel + 1)
  const xpToNext = nextLevelInfo ? nextLevelInfo.xpRequired : 0

  return {
    level: currentLevel,
    currentXp: currentXpInLevel,
    xpToNext,
    title: LEVELS.find(l => l.level === currentLevel)?.title || "Unknown"
  }
}

export function getLevelInfo(level: number): LevelInfo | null {
  return LEVELS.find(l => l.level === level) || null
}

// ============================================================================
// TASK XP REWARDS
// ============================================================================

const TASK_XP_REWARDS: Record<string, Record<string, number>> = {
  timed: {
    easy: 30,
    medium: 50,
    hard: 80,
  },
  daily: {
    easy: 25,
    medium: 40,
    hard: 65,
  },
  streak: {
    easy: 35,
    medium: 55,
    hard: 90,
  },
}

export function getTaskXpReward(taskType: string, difficulty: string): number {
  return TASK_XP_REWARDS[taskType]?.[difficulty] || 0
}

// ============================================================================
// STREAK BONUSES
// ============================================================================

export function calculateStreakBonus(streakLength: number): number {
  if (streakLength >= 30) return 50  // 30+ day streak
  if (streakLength >= 14) return 30  // 2+ week streak
  if (streakLength >= 7) return 20   // 1+ week streak
  if (streakLength >= 3) return 10   // 3+ day streak
  return 0 // No bonus for short streaks
}

// ============================================================================
// ACHIEVEMENT XP BONUSES
// ============================================================================

export const ACHIEVEMENT_BONUSES = {
  domain_specific: 100,
  general: 200,
  streak_based: 150,
  level_based: 250,
}

// ============================================================================
// TASK TIME LIMITS
// ============================================================================

export const TASK_TIME_LIMITS = {
  timed: {
    easy: 5 * 60,    // 5 minutes
    medium: 10 * 60, // 10 minutes
    hard: 15 * 60,   // 15 minutes
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatXp(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  return xp.toString()
}

export function getProgressPercentage(currentXp: number, level: number): number {
  const currentLevelInfo = getLevelInfo(level)
  const nextLevelInfo = getLevelInfo(level + 1)

  if (!currentLevelInfo || !nextLevelInfo) return 100

  const levelStartXp = currentLevelInfo.totalXpRequired
  const levelEndXp = nextLevelInfo.totalXpRequired
  const levelRange = levelEndXp - levelStartXp

  if (levelRange === 0) return 100

  return Math.min(100, ((currentXp - levelStartXp) / levelRange) * 100)
}
