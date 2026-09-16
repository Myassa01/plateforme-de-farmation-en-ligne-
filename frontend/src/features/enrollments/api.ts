import { apiClient } from '@/services/apiClient'
import type { Enrollment } from './types'

export const enrollmentsApi = {
  listMine: () => apiClient.get<Enrollment[]>('/my-courses').then((res) => res.data),

  enroll: (courseId: string) =>
    apiClient.post<Enrollment>(`/courses/${courseId}/enroll`).then((res) => res.data),
}
