import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useMyCourses } from '@/features/courses/hooks/useMyCourses'
import { useSubmitCourse } from '@/features/courses/hooks/useCourseMutations'
import { formatPrice, statusLabels, statusTones } from '@/features/courses/utils'
import { CourseStudentsPanel } from '@/features/enrollments/components/CourseStudentsPanel'
import { resolveMediaUrl } from '@/utils/media'

export function InstructorCoursesPage() {
  const { data, isLoading } = useMyCourses()
  const submitCourse = useSubmitCourse()
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mes formations</h1>
        <Link to="/instructor/courses/new">
          <Button variant="primary">Créer une formation</Button>
        </Link>
      </div>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            title="Vous n'avez pas encore de formation"
            description="Créez votre première formation pour commencer à enseigner."
          />
        )}

        {data && data.items.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.items.map((course) => (
              <div
                key={course.id}
                className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
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
                      <p className="truncate font-medium text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">
                        {course.category.name} · {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={statusTones[course.status]}>{statusLabels[course.status]}</Badge>
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
                    <Link to={`/instructor/courses/${course.id}/curriculum`}>
                      <Button variant="secondary">Curriculum</Button>
                    </Link>
                    {course.status === 'draft' && (
                      <Button
                        variant="secondary"
                        isLoading={submitCourse.isPending}
                        onClick={() => submitCourse.mutate(course.id)}
                      >
                        Soumettre
                      </Button>
                    )}
                  </div>
                </div>

                {expandedCourseId === course.id && <CourseStudentsPanel courseId={course.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
