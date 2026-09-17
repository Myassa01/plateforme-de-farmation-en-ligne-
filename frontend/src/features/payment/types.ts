export type PaymentStatus = 'pending' | 'succeeded' | 'failed'

export interface Payment {
  id: string
  course_id: string
  amount: string
  status: PaymentStatus
  method: string
  created_at: string
}
