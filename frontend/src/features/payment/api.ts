import { apiClient } from '@/services/apiClient'
import type { Payment } from './types'

export const paymentApi = {
  pay: (courseId: string) =>
    apiClient.post<Payment>(`/courses/${courseId}/pay`, {}).then((res) => res.data),
}
