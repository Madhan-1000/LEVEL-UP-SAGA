// Task types will be inferred from usage

// ============================================================================
// CHEATING DETECTION SYSTEM
// ============================================================================

export interface CheatDetectionResult {
  isCheating: boolean
  reason?: string
  severity: 'low' | 'medium' | 'high'
}

// Configuration for cheating detection
export const CHEAT_CONFIG = {
  // Time window to check for rapid completions (in seconds)
  RAPID_COMPLETION_WINDOW: 10, // 10 seconds

  // Maximum tasks that can be completed in the time window
  MAX_TASKS_IN_WINDOW: 2,

  // Suspicious completion speeds (in seconds)
  MIN_SUSPICIOUS_SPEED: 1, // Tasks completed in less than 1 second
  MAX_SUSPICIOUS_SPEED: 300, // Tasks taking longer than 5 minutes (timed tasks only)

  // Pattern detection
  MIN_PATTERN_LENGTH: 5, // Minimum tasks to detect patterns
  IDENTICAL_TIMING_THRESHOLD: 2, // Max identical completion times
}

/**
 * Detects cheating based on task completion patterns
 */
export function detectCheating(
  recentTasks: Array<{ completedAt: Date; completionSpeed?: number | null; result?: string | null }>,
  currentTaskSpeed?: number
): CheatDetectionResult {

  // Check for rapid completion pattern
  const rapidCompletionResult = detectRapidCompletions(recentTasks)
  if (rapidCompletionResult.isCheating) {
    return rapidCompletionResult
  }

  // Check for suspicious completion speed
  if (currentTaskSpeed !== undefined) {
    const speedResult = detectSuspiciousSpeed(currentTaskSpeed)
    if (speedResult.isCheating) {
      return speedResult
    }
  }

  // Check for timing patterns
  const patternResult = detectTimingPatterns(recentTasks)
  if (patternResult.isCheating) {
    return patternResult
  }

  return { isCheating: false, severity: 'low' }
}

/**
 * Detects when too many tasks are completed in a short time window
 */
function detectRapidCompletions(
  recentTasks: Array<{ completedAt: Date }>
): CheatDetectionResult {
  const now = new Date()
  const windowStart = new Date(now.getTime() - CHEAT_CONFIG.RAPID_COMPLETION_WINDOW * 1000)

  const recentCompletions = recentTasks.filter(task =>
    task.completedAt >= windowStart && task.completedAt <= now
  )

  if (recentCompletions.length > CHEAT_CONFIG.MAX_TASKS_IN_WINDOW) {
    return {
      isCheating: true,
      reason: `Completed ${recentCompletions.length} tasks in ${CHEAT_CONFIG.RAPID_COMPLETION_WINDOW} seconds`,
      severity: 'high'
    }
  }

  return { isCheating: false, severity: 'low' }
}

/**
 * Detects suspiciously fast or slow task completions
 */
function detectSuspiciousSpeed(completionSpeed: number): CheatDetectionResult {
  if (completionSpeed < CHEAT_CONFIG.MIN_SUSPICIOUS_SPEED) {
    return {
      isCheating: true,
      reason: `Task completed in ${completionSpeed} seconds (too fast)`,
      severity: 'medium'
    }
  }

  if (completionSpeed > CHEAT_CONFIG.MAX_SUSPICIOUS_SPEED) {
    return { isCheating: false, severity: 'low' }
  }

  return { isCheating: false, severity: 'low' }
}

/**
 * Detects patterns in task completion timing that suggest automation
 */
function detectTimingPatterns(
  recentTasks: Array<{ completedAt: Date; completionSpeed?: number | null }>
): CheatDetectionResult {
  if (recentTasks.length < CHEAT_CONFIG.MIN_PATTERN_LENGTH) {
    return { isCheating: false, severity: 'low' }
  }

  // Check for identical timing patterns
  const speeds = recentTasks
    .map(task => task.completionSpeed)
    .filter(speed => speed !== null && speed !== undefined)

  if (speeds.length >= CHEAT_CONFIG.IDENTICAL_TIMING_THRESHOLD) {
    const speedCounts = speeds.reduce((acc, speed) => {
      acc[speed] = (acc[speed] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const maxIdentical = Math.max(...Object.values(speedCounts))
    if (maxIdentical >= CHEAT_CONFIG.IDENTICAL_TIMING_THRESHOLD) {
      return {
        isCheating: true,
        reason: `Identical completion timing detected (${maxIdentical} tasks with same speed)`,
        severity: 'medium'
      }
    }
  }

  return { isCheating: false, severity: 'low' }
}

/**
 * Calculates the consequences of cheating detection
 */
export function getCheatingConsequences(severity: 'low' | 'medium' | 'high') {
  switch (severity) {
    case 'low':
      return {
        taskResult: 'failure' as const,
        xpPenalty: 0,
        streakBreak: false,
        warning: true
      }

    case 'medium':
      return {
        taskResult: 'cheated' as const,
        xpPenalty: 50, // Lose earned XP
        streakBreak: true,
        warning: true
      }

    case 'high':
      return {
        taskResult: 'cheated' as const,
        xpPenalty: 100, // Lose earned XP + penalty
        streakBreak: true,
        warning: true,
        suspensionHours: 24 // Temporary suspension
      }
  }
}

/**
 * Logs cheating detection for monitoring
 */
export function logCheatingDetection(
  userId: string,
  taskId: string,
  detection: CheatDetectionResult,
  context: {
    recentTasks: number
    completionSpeed?: number
    userAgent?: string
    ipAddress?: string
  }
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    taskId,
    detection,
    context,
    severity: detection.severity
  }

  // In production, this would be sent to a logging service
  console.warn('CHEATING DETECTED:', logEntry)

  // Best-effort send to a monitoring webhook if configured
  const webhook = process.env.CHEAT_MONITORING_WEBHOOK
  if (webhook) {
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    }).catch((err) => {
      console.error('Failed to send cheat log', err)
    })
  }
}
