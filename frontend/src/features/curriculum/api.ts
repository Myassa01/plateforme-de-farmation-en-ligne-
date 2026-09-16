import { apiClient } from '@/services/apiClient'
import type {
  CreateLessonPayload,
  CreateSectionPayload,
  Lesson,
  Section,
  SectionWithLessons,
  SectionWithQuizzes,
} from './types'

export const curriculumApi = {
  getForCourse: (courseId: string) =>
    apiClient
      .get<SectionWithLessons[]>(`/courses/${courseId}/curriculum`)
      .then((res) => res.data),

  getForEditor: (courseId: string) =>
    apiClient
      .get<SectionWithQuizzes[]>(`/courses/${courseId}/curriculum-editor`)
      .then((res) => res.data),

  createSection: (courseId: string, payload: CreateSectionPayload) =>
    apiClient
      .post<Section>(`/courses/${courseId}/sections`, payload)
      .then((res) => res.data),

  deleteSection: (sectionId: string) => apiClient.delete(`/sections/${sectionId}`),

  createLesson: (sectionId: string, payload: CreateLessonPayload) =>
    apiClient.post<Lesson>(`/sections/${sectionId}/lessons`, payload).then((res) => res.data),

  deleteLesson: (lessonId: string) => apiClient.delete(`/lessons/${lessonId}`),
}
