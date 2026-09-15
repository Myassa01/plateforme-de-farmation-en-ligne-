import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { CourseFilters } from '../types'

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.list(filters),
  })
}
