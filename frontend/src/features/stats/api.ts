import { apiClient } from '@/services/apiClient'
import type { AdminStats, InstructorStats, StudentStats } from './types'

export const statsApi = {
  getStudentStats: () =>
    apiClient.get<StudentStats>('/stats/student').then((res) => res.data),

  getInstructorStats: () =>
    apiClient.get<InstructorStats>('/stats/instructor').then((res) => res.data),

  getAdminStats: () => apiClient.get<AdminStats>('/stats/admin').then((res) => res.data),
}
