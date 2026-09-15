import type { CourseLevel, CourseStatus } from './types'

export const levelLabels: Record<CourseLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

export const statusLabels: Record<CourseStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  published: 'Publié',
  rejected: 'Rejeté',
}

export const statusTones: Record<CourseStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  pending: 'warning',
  published: 'success',
  rejected: 'danger',
}

export function formatPrice(price: string): string {
  const value = Number(price)
  if (value === 0) return 'Gratuit'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}
