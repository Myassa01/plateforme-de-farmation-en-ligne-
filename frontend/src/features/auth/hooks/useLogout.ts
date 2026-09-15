import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function useLogout() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  return () => {
    clearSession()
    navigate('/login')
  }
}
