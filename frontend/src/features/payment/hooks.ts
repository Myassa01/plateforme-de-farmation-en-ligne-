import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentApi } from './api'

export function usePayForCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => paymentApi.pay(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
    },
  })
}
