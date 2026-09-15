import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)

  return {
    user,
    isAuthenticated: Boolean(accessToken && user),
  }
}
