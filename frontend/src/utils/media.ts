import { env } from '@/config/env'

export function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${env.apiBaseUrl}${url}`
}
