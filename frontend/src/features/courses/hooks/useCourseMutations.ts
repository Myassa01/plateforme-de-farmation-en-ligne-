import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '../api'
import type { CreateCoursePayload } from '../types'

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => coursesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['all-courses'] })
    },
  })
}

export function useSubmitCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursesApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['all-courses'] })
      queryClient.invalidateQueries({ queryKey: ['pending-courses'] })
    },
  })
}

export function useApproveCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursesApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-courses'] })
      queryClient.invalidateQueries({ queryKey: ['all-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useRejectCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => coursesApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-courses'] })
      queryClient.invalidateQueries({ queryKey: ['all-courses'] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-courses'] })
      queryClient.invalidateQueries({ queryKey: ['pending-courses'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}
