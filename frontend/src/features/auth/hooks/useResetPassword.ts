import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api'

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  })
}
