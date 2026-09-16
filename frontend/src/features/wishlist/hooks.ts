import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from './api'

export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.list,
  })
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => wishlistApi.add(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (courseId: string) => wishlistApi.remove(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}
