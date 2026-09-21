import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useApproveCourse, useRejectCourse } from '@/features/courses/hooks/useCourseMutations'
import { useAllCourses } from '@/features/courses/hooks/useAllCourses'
import { formatPrice, statusLabels, statusTones } from '@/features/courses/utils'
import { CourseStudentsPanel } from '@/features/enrollments/components/CourseStudentsPanel'
import { resolveMediaUrl } from '@/utils/media'

export function AdminCoursesPage() {
  const { data, isLoading } = useAllCourses()
  const approveCourse = useApproveCourse()
  const rejectCourse = useRejectCourse()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Toutes les formations</h1>
        <Link to="/admin/courses/new">
          <Button variant="primary">Créer une formation</Button>
        </Link>
      </div>

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
            title="Aucune formation pour le moment"
            description="Créez la première formation de la plateforme."
          />
        )}

        {data && data.items.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.items.map((course) => (
              <div key={course.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {course.thumbnail_url ? (
                        <img
                          src={resolveMediaUrl(course.thumbnail_url) ?? undefined}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          Pas d'image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-slate-900">{course.title}</p>
                        <Badge tone={statusTones[course.status]}>{statusLabels[course.status]}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Par {course.instructor.full_name} · {course.category.name} ·{' '}
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {course.status === 'published' && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setExpandedCourseId(expandedCourseId === course.id ? null : course.id)
                        }
                      >
                        {expandedCourseId === course.id ? 'Masquer les étudiants' : 'Voir les étudiants'}
                      </Button>
                    )}
                    {course.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          isLoading={approveCourse.isPending}
                          onClick={() => approveCourse.mutate(course.id)}
                        >
                          Approuver
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setRejectingId(rejectingId === course.id ? null : course.id)
                          }
                        >
                          Rejeter
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {expandedCourseId === course.id && <CourseStudentsPanel courseId={course.id} />}

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
