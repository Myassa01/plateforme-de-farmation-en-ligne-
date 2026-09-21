export interface CourseProgress {
  course_id: string
  total_lessons: number
  completed_lessons: number
  percentage: number
  completed_lesson_ids: string[]
  watched_seconds_by_lesson: Record<string, number>
}
