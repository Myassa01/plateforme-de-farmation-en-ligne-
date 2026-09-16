import { apiClient } from '@/services/apiClient'
import type { CourseProgress } from './types'

export const playerApi = {
  getProgress: (courseId: string) =>
    apiClient.get<CourseProgress>(`/courses/${courseId}/progress`).then((res) => res.data),

  completeLesson: (lessonId: string) =>
    apiClient.post(`/lessons/${lessonId}/complete`).then((res) => res.data),
}
