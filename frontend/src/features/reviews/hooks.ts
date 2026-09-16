import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from './api'
import type { CreateReviewPayload, UpdateReviewPayload } from './types'

export function useCourseReviews(courseId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => reviewsApi.listForCourse(courseId as string),
    enabled: Boolean(courseId),
  })
}

export function useCourseRatingSummary(courseId: string | undefined) {
  return useQuery({
    queryKey: ['reviews-summary', courseId],
    queryFn: () => reviewsApi.getSummary(courseId as string),
    enabled: Boolean(courseId),
  })
}

function invalidateReviews(queryClient: ReturnType<typeof useQueryClient>, courseId: string) {
  queryClient.invalidateQueries({ queryKey: ['reviews', courseId] })
  queryClient.invalidateQueries({ queryKey: ['reviews-summary', courseId] })
}

export function useCreateReview(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.create(courseId, payload),
    onSuccess: () => invalidateReviews(queryClient, courseId),
  })
}

export function useUpdateReview(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      reviewsApi.update(reviewId, payload),
    onSuccess: () => invalidateReviews(queryClient, courseId),
  })
}

export function useDeleteReview(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.remove(reviewId),
    onSuccess: () => invalidateReviews(queryClient, courseId),
  })
}
