import { apiClient } from '@/services/apiClient'
import type { Course, CourseFilters, CreateCoursePayload, PaginatedCourses } from './types'

function toQueryParams(filters: CourseFilters): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  }
  return params
}

export const coursesApi = {
  list: (filters: CourseFilters = {}) =>
    apiClient
      .get<PaginatedCourses>('/courses', { params: toQueryParams(filters) })
      .then((res) => res.data),

  listMine: (filters: CourseFilters = {}) =>
    apiClient
      .get<PaginatedCourses>('/instructor/courses', { params: toQueryParams(filters) })
      .then((res) => res.data),

  listPending: (filters: CourseFilters = {}) =>
    apiClient
      .get<PaginatedCourses>('/admin/courses/pending', { params: toQueryParams(filters) })
      .then((res) => res.data),

  listAll: (filters: CourseFilters = {}) =>
    apiClient
      .get<PaginatedCourses>('/admin/courses', { params: toQueryParams(filters) })
      .then((res) => res.data),

  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`).then((res) => res.data),

  create: (payload: CreateCoursePayload) =>
    apiClient.post<Course>('/courses', payload).then((res) => res.data),

  update: (id: string, payload: Partial<CreateCoursePayload>) =>
    apiClient.patch<Course>(`/courses/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/courses/${id}`),

  submit: (id: string) => apiClient.post<Course>(`/courses/${id}/submit`).then((res) => res.data),

  approve: (id: string) => apiClient.post<Course>(`/courses/${id}/approve`).then((res) => res.data),

  reject: (id: string, reason: string) =>
    apiClient.post<Course>(`/courses/${id}/reject`, { reason }).then((res) => res.data),

  uploadThumbnail: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<Course>(`/courses/${id}/thumbnail`, formData).then((res) => res.data)
  },
}
