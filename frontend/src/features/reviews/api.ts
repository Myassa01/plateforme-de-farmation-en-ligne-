import { apiClient } from '@/services/apiClient'
import type {
  CourseRatingSummary,
  CreateReviewPayload,
  Review,
  UpdateReviewPayload,
} from './types'

export const reviewsApi = {
  listForCourse: (courseId: string) =>
    apiClient.get<Review[]>(`/courses/${courseId}/reviews`).then((res) => res.data),

  getSummary: (courseId: string) =>
    apiClient
      .get<CourseRatingSummary>(`/courses/${courseId}/reviews/summary`)
      .then((res) => res.data),

  create: (courseId: string, payload: CreateReviewPayload) =>
    apiClient.post<Review>(`/courses/${courseId}/reviews`, payload).then((res) => res.data),

  update: (reviewId: string, payload: UpdateReviewPayload) =>
    apiClient.patch<Review>(`/reviews/${reviewId}`, payload).then((res) => res.data),

  remove: (reviewId: string) => apiClient.delete(`/reviews/${reviewId}`),
}
