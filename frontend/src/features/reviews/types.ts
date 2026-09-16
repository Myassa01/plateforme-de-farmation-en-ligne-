export interface StudentSummary {
  id: string
  full_name: string
}

export interface Review {
  id: string
  course_id: string
  student: StudentSummary
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface CourseRatingSummary {
  average_rating: number
  total_reviews: number
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
}

export interface UpdateReviewPayload {
  rating?: number
  comment?: string
}
