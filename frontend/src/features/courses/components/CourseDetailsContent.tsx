import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCourse } from '@/features/courses/hooks/useCourse'
import { formatPrice, levelLabels } from '@/features/courses/utils'
import { useMyEnrollments } from '@/features/enrollments/hooks'
import { PaymentModal } from '@/features/payment/components/PaymentModal'
import { CourseReviews } from '@/features/reviews/components/CourseReviews'
import { useAddToWishlist } from '@/features/wishlist/hooks'
import { useAuth } from '@/hooks/useAuth'

export function CourseDetailsContent() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading, isError } = useCourse(courseId)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const addToWishlist = useAddToWishlist()
  const isStudent = user?.role === 'student'
  const { data: myEnrollments } = useMyEnrollments(isStudent)
  const isEnrolled = myEnrollments?.some((enrollment) => enrollment.course.id === courseId) ?? false

  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [justPaid, setJustPaid] = useState(false)

  const handleOpenPayment = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setIsPaymentOpen(true)
  }

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (courseId) addToWishlist.mutate(courseId)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <EmptyState
        title="Formation introuvable"
        description="Cette formation n'existe pas ou n'est plus disponible."
      />
    )
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{course.category.name}</Badge>
        <Badge>{levelLabels[course.level]}</Badge>
      </div>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">{course.title}</h1>
      <p className="mt-2 text-slate-600">Par {course.instructor.full_name}</p>

      <p className="mt-6 whitespace-pre-line text-slate-700">{course.description}</p>

      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
        <span className="text-2xl font-bold text-slate-900">{formatPrice(course.price)}</span>
        <div className="flex items-center gap-2">
          {isStudent && isEnrolled ? (
            <Link to={`/student/courses/${course.id}/player`}>
              <Button variant="primary">Continuer la formation</Button>
            </Link>
          ) : (
            <>
              {(isStudent || !isAuthenticated) && (
                <Button
                  variant="secondary"
                  isLoading={addToWishlist.isPending}
                  onClick={handleAddToWishlist}
                >
                  Ajouter aux favoris
                </Button>
              )}
              {(isStudent || !isAuthenticated) && (
                <Button variant="primary" onClick={handleOpenPayment}>
                  {Number(course.price) === 0 ? "S'inscrire" : 'Acheter'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {justPaid && (
        <p className="mt-4 text-sm text-green-600">
          Inscription réussie ! Retrouvez cette formation dans "Mes formations".
        </p>
      )}
      {addToWishlist.isSuccess && (
        <p className="mt-4 text-sm text-green-600">Ajouté à vos favoris.</p>
      )}

      <CourseReviews courseId={course.id} />

      {isPaymentOpen && (
        <PaymentModal
          courseId={course.id}
          courseTitle={course.title}
          price={course.price}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => {
            setIsPaymentOpen(false)
            setJustPaid(true)
          }}
        />
      )}
    </div>
  )
}
