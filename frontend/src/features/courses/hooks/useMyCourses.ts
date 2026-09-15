import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { CourseFilters } from '../types'

export function useMyCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ['instructor-courses', filters],
    queryFn: () => coursesApi.listMine(filters),
  })
}
