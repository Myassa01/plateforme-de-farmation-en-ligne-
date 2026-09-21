import type { CourseListItem } from '@/features/courses/types'
import type { Enrollment } from '@/features/enrollments/types'

export interface StudentStats {
  courses_in_progress: number
  courses_completed: number
  certificates_count: number
  average_quiz_score: number
  continue_learning: Enrollment[]
}

export interface InstructorStats {
  total_courses: number
  published_courses: number
  pending_courses: number
  draft_courses: number
  total_students: number
  total_revenue: string
  average_rating: number
  top_courses: CourseListItem[]
}

export interface AdminStats {
  total_users: number
  total_students: number
  total_instructors: number
  total_courses: number
  pending_courses: number
  published_courses: number
  total_enrollments: number
  total_revenue: string
  recent_pending_courses: CourseListItem[]
}
