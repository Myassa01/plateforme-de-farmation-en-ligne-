import type { CourseListItem } from '@/features/courses/types'

export interface Enrollment {
  id: string
  course: CourseListItem
  enrolled_at: string
  completed_at: string | null
}
