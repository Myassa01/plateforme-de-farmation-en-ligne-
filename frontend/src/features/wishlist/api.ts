import { apiClient } from '@/services/apiClient'
import type { WishlistItem } from './types'

export const wishlistApi = {
  list: () => apiClient.get<WishlistItem[]>('/wishlist').then((res) => res.data),

  add: (courseId: string) =>
    apiClient.post<WishlistItem>(`/wishlist/${courseId}`).then((res) => res.data),

  remove: (courseId: string) => apiClient.delete(`/wishlist/${courseId}`),
}
