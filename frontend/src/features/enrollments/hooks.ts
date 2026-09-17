import { useQuery } from '@tanstack/react-query'
import { enrollmentsApi } from './api'

export function useMyEnrollments(enabled = true) {
  return useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentsApi.listMine,
    enabled,
  })
}
