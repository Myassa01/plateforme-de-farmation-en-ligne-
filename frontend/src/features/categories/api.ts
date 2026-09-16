import { apiClient } from '@/services/apiClient'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from './types'

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/categories').then((res) => res.data),

  create: (payload: CreateCategoryPayload) =>
    apiClient.post<Category>('/categories', payload).then((res) => res.data),

  update: (id: string, payload: UpdateCategoryPayload) =>
    apiClient.patch<Category>(`/categories/${id}`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/categories/${id}`),
}
