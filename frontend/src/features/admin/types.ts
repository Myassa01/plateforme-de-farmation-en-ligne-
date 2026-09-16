import type { User, UserRole } from '@/types/user'

export interface PaginatedUsers {
  items: User[]
  total: number
  page: number
  page_size: number
}

export interface UserFilters {
  role?: UserRole
  page?: number
  page_size?: number
}
