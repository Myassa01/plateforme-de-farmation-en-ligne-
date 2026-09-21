import type { CourseListItem } from '@/features/courses/types'

export interface Enrollment {
  id: string
  course: CourseListItem
  enrolled_at: string
  completed_at: string | null
}

export interface EnrolledStudent {
  id: string
  full_name: string
  email: string
}

export interface CourseEnrollment {
  id: string
  student: EnrolledStudent
  enrolled_at: string
  completed_at: string | null
}
