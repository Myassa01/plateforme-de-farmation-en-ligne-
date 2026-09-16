import type { CourseListItem } from '@/features/courses/types'

export interface WishlistItem {
  id: string
  course: CourseListItem
  created_at: string
}
