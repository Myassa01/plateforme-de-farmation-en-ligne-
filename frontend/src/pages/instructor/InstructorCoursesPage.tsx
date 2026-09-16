import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useMyCourses } from '@/features/courses/hooks/useMyCourses'
import { useSubmitCourse } from '@/features/courses/hooks/useCourseMutations'
import { formatPrice, statusLabels, statusTones } from '@/features/courses/utils'

export function InstructorCoursesPage() {
  const { data, isLoading } = useMyCourses()
  const submitCourse = useSubmitCourse()

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
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-900">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    {course.category.name} · {formatPrice(course.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTones[course.status]}>{statusLabels[course.status]}</Badge>
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
