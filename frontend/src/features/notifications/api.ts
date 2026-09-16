import { apiClient } from '@/services/apiClient'
import type { Notification } from './types'

export const notificationsApi = {
  list: () => apiClient.get<Notification[]>('/notifications').then((res) => res.data),

  markAsRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`).then((res) => res.data),
}
