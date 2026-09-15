import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../api'

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getById(id as string),
    enabled: Boolean(id),
  })
}
