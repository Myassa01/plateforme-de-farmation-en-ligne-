import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '../api'
import type { LoginPayload } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (tokens) => {
      useAuthStore.getState().setAccessToken(tokens.access_token)
      const user = await authApi.getMe()
      setSession(tokens.access_token, tokens.refresh_token, user)
      navigate(dashboardPathForRole(user.role))
    },
  })
}

export function dashboardPathForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'instructor':
      return '/instructor'
    default:
      return '/student'
  }
}
