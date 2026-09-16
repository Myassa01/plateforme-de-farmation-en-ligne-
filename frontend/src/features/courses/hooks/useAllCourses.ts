import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { CourseFilters } from '../types'

export function useAllCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['all-courses', filters],
    queryFn: () => coursesApi.listAll(filters),
  })
}
