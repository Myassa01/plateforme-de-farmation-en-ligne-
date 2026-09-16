import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserRole } from '@/types/user'
import { adminUsersApi } from './api'
import type { UserFilters } from './types'

export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminUsersApi.list(filters),
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminUsersApi.updateRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export function useToggleUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, activate }: { userId: string; activate: boolean }) =>
      activate ? adminUsersApi.activate(userId) : adminUsersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
