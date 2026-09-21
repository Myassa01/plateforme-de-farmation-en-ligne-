import { apiClient } from '@/services/apiClient'
import type { Certificate, CertificateSettings, CreateCertificatePayload } from './types'

export const certificatesApi = {
  create: (payload: CreateCertificatePayload) =>
    apiClient.post<Certificate>('/certificates', payload).then((res) => res.data),

  listMine: () => apiClient.get<Certificate[]>('/certificates/me').then((res) => res.data),

  listAll: () => apiClient.get<Certificate[]>('/certificates').then((res) => res.data),

  getSettings: () =>
    apiClient.get<CertificateSettings>('/certificates/settings').then((res) => res.data),

  uploadBackground: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post<CertificateSettings>('/certificates/settings/background', formData)
      .then((res) => res.data)
  },
}
