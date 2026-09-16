import { apiClient } from '@/services/apiClient'
import type { User, UserRole } from '@/types/user'
import type { PaginatedUsers, UserFilters } from './types'

function toQueryParams(filters: UserFilters): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value)
    }
  }
  return params
}

export const adminUsersApi = {
  list: (filters: UserFilters = {}) =>
    apiClient
      .get<PaginatedUsers>('/admin/users', { params: toQueryParams(filters) })
      .then((res) => res.data),

  updateRole: (userId: string, role: UserRole) =>
    apiClient.patch<User>(`/admin/users/${userId}/role`, { role }).then((res) => res.data),

  deactivate: (userId: string) =>
    apiClient.patch<User>(`/admin/users/${userId}/deactivate`).then((res) => res.data),

  activate: (userId: string) =>
    apiClient.patch<User>(`/admin/users/${userId}/activate`).then((res) => res.data),
}
