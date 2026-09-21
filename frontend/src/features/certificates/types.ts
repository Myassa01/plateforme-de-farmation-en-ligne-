import type { CourseListItem } from '@/features/courses/types'

export interface StudentSummary {
  id: string
  full_name: string
  email: string
}

export interface Certificate {
  id: string
  student: StudentSummary
  course: CourseListItem
  issued_at: string
  created_at: string
}

export interface CreateCertificatePayload {
  student_id: string
  course_id: string
  issued_at?: string
}

export interface CertificateSettings {
  background_url: string | null
}
