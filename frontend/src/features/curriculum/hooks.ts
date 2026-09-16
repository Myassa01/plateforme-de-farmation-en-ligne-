import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { curriculumApi } from './api'
import type { CreateLessonPayload, CreateSectionPayload } from './types'

export function useCurriculum(courseId: string | undefined) {
  return useQuery({
    queryKey: ['curriculum', courseId],
    queryFn: () => curriculumApi.getForCourse(courseId as string),
    enabled: Boolean(courseId),
  })
}

export function useCreateSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => curriculumApi.createSection(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
    },
  })
}

export function useDeleteSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sectionId: string) => curriculumApi.deleteSection(sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
    },
  })
}

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: CreateLessonPayload }) =>
      curriculumApi.createLesson(sectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
    },
  })
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => curriculumApi.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
    },
  })
}
