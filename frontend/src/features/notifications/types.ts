export type NotificationType =
  | 'course_approved'
  | 'course_rejected'
  | 'new_enrollment'
  | 'certificate_available'
  | 'general'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  related_entity_id: string | null
  created_at: string
}
