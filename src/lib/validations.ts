import { z } from 'zod'

// ============================================================================
// SHARED VALIDATION SCHEMAS
// ============================================================================

export const objectIdSchema = z.string().cuid('Invalid ID format')

// ============================================================================
// TASK VALIDATION SCHEMAS
// ============================================================================

export const createTaskSchema = z.object({
  templateId: z.string().cuid('Invalid template ID'),
  domainId: z.string().optional(), // For custom tasks
})

export const completeTaskSchema = z.object({
  taskId: objectIdSchema,
  completedAt: z.string().datetime().optional(),
  userRating: z.number().min(1).max(5).optional(),
  reviewNotes: z.string().max(500).optional(),
})

export const updateTaskSchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'failed', 'cheated']).optional(),
  userRating: z.number().min(1).max(5).optional(),
  reviewNotes: z.string().max(500).optional(),
})

// ============================================================================
// PROGRESS VALIDATION SCHEMAS
// ============================================================================

export const updateProgressSchema = z.object({
  currentXp: z.number().min(0).optional(),
  currentStreak: z.number().min(0).optional(),
  lastActivityAt: z.string().datetime().optional(),
})

// ============================================================================
// ACHIEVEMENT VALIDATION SCHEMAS
// ============================================================================

export const checkAchievementSchema = z.object({
  achievementId: objectIdSchema,
})

// ============================================================================
// REVIEW VALIDATION SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  overallSatisfaction: z.number().min(1).max(5),
  tasksCompleted: z.number().min(0).default(0),
  tasksFailed: z.number().min(0).default(0),
  reflectionNotes: z.string().max(1000).optional(),
})

export const updateReviewSchema = createReviewSchema.partial()

// ============================================================================
// DOMAIN VALIDATION SCHEMAS
// ============================================================================

export const selectDomainsSchema = z.object({
  domainIds: z.array(z.string()).min(1).max(2, 'Maximum 2 domains allowed'),
}).refine(
  (data) => {
    // Ensure no duplicate domains
    return new Set(data.domainIds).size === data.domainIds.length
  },
  { message: 'Duplicate domains not allowed' }
)

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type SelectDomainsInput = z.infer<typeof selectDomainsSchema>
