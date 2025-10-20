export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  exam_preparing_for: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface MainsEvaluation {
  id: string
  user_id: string
  question: string
  answer_files: string[]
  evaluation_result: {
    score: number
    extracted_question?: string
    marks_allocated?: number
    word_limit?: number
    actual_word_count?: number
    structure: string
    content_quality: string
    presentation: string
    adherence_to_word_limit?: string
    key_strengths?: string[]
    key_weaknesses?: string[]
    suggestions: string[]
  } | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface PrelimsQuestion {
  id: string
  question: string
  options: {
    a: string
    b: string
    c: string
    d: string
  }
  correct_answer: 'a' | 'b' | 'c' | 'd'
  explanation: string
  topic: string
  difficulty: 'conceptual' | 'application' | 'upsc_level'
}

export interface PrelimsSession {
  id: string
  user_id: string
  topic: string
  difficulty: 'conceptual' | 'application' | 'upsc_level'
  questions: PrelimsQuestion[]
  user_answers: Record<string, string>
  score: number | null
  created_at: string
}

export type DifficultyLevel = 'conceptual' | 'application' | 'upsc_level'

export interface GenerateQuestionsParams {
  topic: string
  numQuestions: number
  difficulty: DifficultyLevel
}
