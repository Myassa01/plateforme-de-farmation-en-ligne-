export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected'

export interface InstructorSummary {
  id: string
  full_name: string
}

export interface CategorySummary {
  id: string
  name: string
  slug: string
}

export interface CourseListItem {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  level: CourseLevel
  language: string
  price: string
  status: CourseStatus
  instructor: InstructorSummary
  category: CategorySummary
}

export interface Course extends CourseListItem {
  description: string
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedCourses {
  items: CourseListItem[]
  total: number
  page: number
  page_size: number
}

export interface CourseFilters {
  search?: string
  category_id?: string
  level?: CourseLevel
  language?: string
  min_price?: number
  max_price?: number
  sort_by?: 'created_at' | 'price' | 'title'
  sort_order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export interface CreateCoursePayload {
  title: string
  description: string
  category_id: string
  level: CourseLevel
  language: string
  price: number
  thumbnail_url?: string
}
