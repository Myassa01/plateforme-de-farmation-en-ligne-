import { useState } from 'react'
import { Button } from '@/components/Button'
import { StarRating } from '@/components/StarRating'
import { useMyEnrollments } from '@/features/enrollments/hooks'
import { useAuth } from '@/hooks/useAuth'
import {
  useCourseRatingSummary,
  useCourseReviews,
  useCreateReview,
  useDeleteReview,
  useUpdateReview,
} from '../hooks'

interface CourseReviewsProps {
  courseId: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function CourseReviews({ courseId }: CourseReviewsProps) {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const { data: reviews, isLoading } = useCourseReviews(courseId)
  const { data: summary } = useCourseRatingSummary(courseId)
  const { data: myEnrollments } = useMyEnrollments(isStudent)
  const isEnrolled = myEnrollments?.some((e) => e.course.id === courseId) ?? false

  const createReview = useCreateReview(courseId)
  const updateReview = useUpdateReview(courseId)
  const deleteReview = useDeleteReview(courseId)

  const myReview = reviews?.find((review) => review.student.id === user?.id)

  const [isEditing, setIsEditing] = useState(false)
  const [draftRating, setDraftRating] = useState(5)
  const [draftComment, setDraftComment] = useState('')

  const startEditing = () => {
    setDraftRating(myReview?.rating ?? 5)
    setDraftComment(myReview?.comment ?? '')
    setIsEditing(true)
  }

  const handleSubmit = () => {
    if (myReview) {
      updateReview.mutate(
        { reviewId: myReview.id, payload: { rating: draftRating, comment: draftComment || undefined } },
        { onSuccess: () => setIsEditing(false) },
      )
    } else {
      createReview.mutate(
        { rating: draftRating, comment: draftComment || undefined },
        { onSuccess: () => setIsEditing(false) },
      )
    }
  }

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Avis</h2>
        {summary && summary.total_reviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(summary.average_rating)} size="sm" />
            <span className="text-sm text-slate-600">
              {summary.average_rating.toFixed(1)} ({summary.total_reviews} avis)
            </span>
          </div>
        )}
      </div>

      {isStudent && isEnrolled && !isEditing && (
        <div className="mt-4">
          <Button variant="secondary" onClick={startEditing}>
            {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
          </Button>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg bg-slate-50 p-4">
          <StarRating value={draftRating} onChange={setDraftRating} />
          <textarea
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
            placeholder="Votre commentaire (optionnel)"
            rows={3}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              isLoading={createReview.isPending || updateReview.isPending}
              onClick={handleSubmit}
            >
              Publier
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            {myReview && (
              <Button
                variant="ghost"
                isLoading={deleteReview.isPending}
                onClick={() =>
                  deleteReview.mutate(myReview.id, { onSuccess: () => setIsEditing(false) })
                }
              >
                Supprimer mon avis
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {isLoading && <p className="text-sm text-slate-500">Chargement des avis...</p>}
        {reviews && reviews.length === 0 && (
          <p className="text-sm text-slate-500">Aucun avis pour le moment.</p>
        )}
        {reviews?.map((review) => (
          <div key={review.id} className="border-b border-slate-100 pb-4 last:border-none">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{review.student.full_name}</p>
              <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
            </div>
            <StarRating value={review.rating} size="sm" />
            {review.comment && <p className="mt-1 text-sm text-slate-700">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
