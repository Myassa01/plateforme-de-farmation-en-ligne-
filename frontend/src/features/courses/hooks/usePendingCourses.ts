import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { CourseFilters } from '../types'

export function usePendingCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['pending-courses', filters],
    queryFn: () => coursesApi.listPending(filters),
  })
}
