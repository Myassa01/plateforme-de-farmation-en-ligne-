import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/types/api'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
})

apiClient.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAccessToken, clearSession } = useAuthStore.getState()
  if (!refreshToken) {
    clearSession()
    throw new ApiError(401, 'No refresh token available')
  }

  try {
    const response = await axios.post(`${env.apiBaseUrl}/auth/refresh`, {
      refresh_token: refreshToken,
    })
    const newAccessToken = response.data.access_token as string
    setAccessToken(newAccessToken)
    return newAccessToken
  } catch (error) {
    clearSession()
    throw error
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newAccessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch {
        return Promise.reject(new ApiError(401, 'Session expired, please log in again'))
      }
    }

    const status = error.response?.status ?? 500
    const detail =
      (error.response?.data as { detail?: string } | undefined)?.detail ?? error.message
    return Promise.reject(new ApiError(status, detail))
  },
)
