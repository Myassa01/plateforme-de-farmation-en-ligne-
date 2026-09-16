export interface Lesson {
  id: string
  section_id: string
  title: string
  video_url: string | null
  duration_seconds: number
  order_index: number
  is_preview: boolean
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

export interface CreateSectionPayload {
  title: string
}

export interface CreateLessonPayload {
  title: string
  video_url?: string
  duration_seconds?: number
  is_preview?: boolean
}
