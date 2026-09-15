import { useState } from 'react'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useApproveCourse, useRejectCourse } from '@/features/courses/hooks/useCourseMutations'
import { usePendingCourses } from '@/features/courses/hooks/usePendingCourses'
import { formatPrice } from '@/features/courses/utils'

export function AdminCoursesPage() {
  const { data, isLoading } = usePendingCourses()
  const approveCourse = useApproveCourse()
  const rejectCourse = useRejectCourse()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const handleReject = (id: string) => {
    if (!reason.trim()) return
    rejectCourse.mutate(
      { id, reason },
      {
        onSuccess: () => {
          setRejectingId(null)
          setReason('')
        },
      },
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Formations en attente de validation</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            title="Aucune formation en attente"
            description="Toutes les soumissions ont été traitées."
          />
        )}

        {data && data.items.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.items.map((course) => (
              <div key={course.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{course.title}</p>
                    <p className="text-sm text-slate-500">
                      Par {course.instructor.full_name} · {course.category.name} ·{' '}
                      {formatPrice(course.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      isLoading={approveCourse.isPending}
                      onClick={() => approveCourse.mutate(course.id)}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setRejectingId(rejectingId === course.id ? null : course.id)}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>

                {rejectingId === course.id && (
                  <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                    <input
                      type="text"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Raison du rejet"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <Button
                      variant="secondary"
                      isLoading={rejectCourse.isPending}
                      onClick={() => handleReject(course.id)}
                    >
                      Confirmer
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
