import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { certificatesApi } from './api'
import type { CreateCertificatePayload } from './types'

export function useMyCertificates() {
  return useQuery({
    queryKey: ['certificates', 'me'],
    queryFn: certificatesApi.listMine,
  })
}

export function useAllCertificates() {
  return useQuery({
    queryKey: ['certificates', 'all'],
    queryFn: certificatesApi.listAll,
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCertificatePayload) => certificatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useCertificateSettings() {
  return useQuery({
    queryKey: ['certificates', 'settings'],
    queryFn: certificatesApi.getSettings,
  })
}

export function useUploadCertificateBackground() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => certificatesApi.uploadBackground(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates', 'settings'] })
    },
  })
}
