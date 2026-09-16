import { apiClient } from '@/services/apiClient'
import type { User } from '@/types/user'
import type { LoginPayload, RegisterPayload, TokenPair } from './types'

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<User>('/auth/register', payload).then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient.post<TokenPair>('/auth/login', payload).then((res) => res.data),

  getMe: (accessToken?: string) =>
    apiClient
      .get<User>('/auth/me', accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined)
      .then((res) => res.data),
}
