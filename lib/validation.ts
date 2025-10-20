import { z } from 'zod'

/**
 * Validation schemas for API inputs
 * Using Zod for runtime type validation and sanitization
 */

// Generate Questions API
export const generateQuestionsSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(200, 'Topic must not exceed 200 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s,.-]+$/, 'Topic contains invalid characters'),
  numQuestions: z.number()
    .int('Number of questions must be an integer')
    .min(1, 'Must generate at least 1 question')
    .max(5, 'Cannot generate more than 5 questions'),
  difficulty: z.enum(['conceptual', 'application', 'upsc_level']),
})

// Evaluate Answer API
export const evaluateAnswerSchema = z.object({
  question: z.string()
    .max(2000, 'Question text too long')
    .trim()
    .optional(),
  answerText: z.string()
    .max(5000, 'Answer text too long')
    .trim()
    .optional(),
  answerFiles: z.array(z.string().url('Invalid file URL'))
    .min(1, 'At least one answer file is required')
    .max(10, 'Maximum 10 files allowed'),
})

// Explain Wrong Answer API
export const explainWrongAnswerSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  questionIndex: z.number()
    .int('Question index must be an integer')
    .min(0, 'Invalid question index'),
  question: z.string()
    .min(10, 'Question text too short')
    .max(2000, 'Question text too long'),
  correctAnswer: z.string()
    .min(1, 'Correct answer required')
    .max(1000, 'Answer text too long'),
  userAnswer: z.string()
    .min(1, 'User answer required')
    .max(1000, 'Answer text too long'),
  correctOption: z.string()
    .regex(/^[a-d]$/i, 'Invalid option format'),
  userOption: z.string()
    .regex(/^[a-d]$/i, 'Invalid option format'),
})

// Mentor Guidance API
export const mentorGuidanceSchema = z.object({
  evaluationId: z.string().uuid('Invalid evaluation ID'),
  actionItemIndex: z.number()
    .int('Action item index must be an integer')
    .min(0, 'Invalid action item index'),
  actionItemText: z.string()
    .min(10, 'Action item text too short')
    .max(1000, 'Action item text too long')
    .trim(),
})

// Profile Update
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters')
    .optional(),
  exam: z.string()
    .max(100, 'Exam name too long')
    .trim()
    .optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string(),
  size: z.number()
    .max(10 * 1024 * 1024, 'File size must not exceed 10MB'),
  type: z.string()
    .regex(/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/, 'Invalid file type'),
})

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>
export type EvaluateAnswerInput = z.infer<typeof evaluateAnswerSchema>
export type ExplainWrongAnswerInput = z.infer<typeof explainWrongAnswerSchema>
export type MentorGuidanceInput = z.infer<typeof mentorGuidanceSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
