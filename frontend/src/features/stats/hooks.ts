import { useQuery } from '@tanstack/react-query'
import { statsApi } from './api'

export function useStudentStats() {
  return useQuery({
    queryKey: ['stats', 'student'],
    queryFn: statsApi.getStudentStats,
  })
}

export function useInstructorStats() {
  return useQuery({
    queryKey: ['stats', 'instructor'],
    queryFn: statsApi.getInstructorStats,
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['stats', 'admin'],
    queryFn: statsApi.getAdminStats,
  })
}
