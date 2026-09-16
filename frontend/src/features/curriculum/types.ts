import type { QuizBuilder } from '@/features/quiz/types'

export interface Lesson {
  id: string
  section_id: string
  title: string
  video_url: string | null
  duration_seconds: number
  order_index: number
  is_preview: boolean
  quiz_id: string | null
}

export interface LessonWithQuiz extends Lesson {
  quiz: QuizBuilder | null
}

export interface Section {
  id: string
  course_id: string
  title: string
  order_index: number
}

export interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

export interface SectionWithQuizzes extends Section {
  lessons: LessonWithQuiz[]
}

export interface CreateSectionPayload {
  title: string
}

export interface CreateLessonPayload {
  title: string
  video_url?: string
  duration_seconds?: number
  is_preview?: boolean
}
