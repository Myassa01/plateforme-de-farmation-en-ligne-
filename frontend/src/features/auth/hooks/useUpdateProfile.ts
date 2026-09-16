import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/apiClient'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/user'

interface UpdateProfilePayload {
  full_name?: string
  bio?: string
  avatar_url?: string
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiClient.patch<User>('/users/me', payload).then((res) => res.data),
    onSuccess: (user) => {
      setUser(user)
    },
  })
}
