import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enrollmentsApi } from './api'

export function useMyEnrollments() {
  return useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentsApi.listMine,
  })
}

export function useEnroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => enrollmentsApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
    },
  })
}
