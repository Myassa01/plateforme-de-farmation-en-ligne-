import { apiClient } from '@/services/apiClient'
import type { CourseEnrollment, Enrollment } from './types'

export const enrollmentsApi = {
  listMine: () => apiClient.get<Enrollment[]>('/my-courses').then((res) => res.data),

  listForCourse: (courseId: string) =>
    apiClient.get<CourseEnrollment[]>(`/courses/${courseId}/students`).then((res) => res.data),
}
