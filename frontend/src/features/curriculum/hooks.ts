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

export function useCurriculumEditor(courseId: string | undefined) {
  return useQuery({
    queryKey: ['curriculum-editor', courseId],
    queryFn: () => curriculumApi.getForEditor(courseId as string),
    enabled: Boolean(courseId),
  })
}

function invalidateCurriculum(queryClient: ReturnType<typeof useQueryClient>, courseId: string) {
  queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
  queryClient.invalidateQueries({ queryKey: ['curriculum-editor', courseId] })
}

export function useCreateSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => curriculumApi.createSection(courseId, payload),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useDeleteSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sectionId: string) => curriculumApi.deleteSection(sectionId),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: CreateLessonPayload }) =>
      curriculumApi.createLesson(sectionId, payload),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => curriculumApi.deleteLesson(lessonId),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useUploadVideo(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      lessonId,
      file,
      onProgress,
    }: {
      lessonId: string
      file: File
      onProgress?: (percent: number) => void
    }) => curriculumApi.uploadVideo(lessonId, file, onProgress),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}
