export type QuestionType = 'multiple_choice' | 'true_false'

export interface AnswerBuilder {
  id: string
  text: string
  is_correct: boolean
}

export interface QuestionBuilder {
  id: string
  text: string
  type: QuestionType
  order_index: number
  answers: AnswerBuilder[]
}

export interface QuizBuilder {
  id: string
  lesson_id: string
  title: string
  passing_score: number
  questions: QuestionBuilder[]
}

export interface AnswerOption {
  id: string
  text: string
}

export interface QuestionForAttempt {
  id: string
  text: string
  type: QuestionType
  order_index: number
  answers: AnswerOption[]
}

export interface QuizForAttempt {
  id: string
  lesson_id: string
  title: string
  passing_score: number
  questions: QuestionForAttempt[]
}

export interface AttemptAnswerResult {
  question_id: string
  selected_answer_id: string
  is_correct: boolean
}

export interface QuizAttemptResult {
  id: string
  quiz_id: string
  score: number
  passed: boolean
  attempted_at: string
  attempt_answers: AttemptAnswerResult[]
}

export interface CreateAnswerPayload {
  text: string
  is_correct: boolean
}

export interface CreateQuestionPayload {
  text: string
  type: QuestionType
  answers: CreateAnswerPayload[]
}

export interface CreateQuizPayload {
  title: string
  passing_score?: number
}
