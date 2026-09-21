import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { playerApi } from './api'

export function useCourseProgress(courseId: string | undefined) {
  return useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => playerApi.getProgress(courseId as string),
    enabled: Boolean(courseId),
  })
}

export function useCompleteLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => playerApi.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
    },
  })
}

export function useSaveWatchProgress() {
  return useMutation({
    mutationFn: ({ lessonId, watchedSeconds }: { lessonId: string; watchedSeconds: number }) =>
      playerApi.saveWatchProgress(lessonId, watchedSeconds),
  })
}
