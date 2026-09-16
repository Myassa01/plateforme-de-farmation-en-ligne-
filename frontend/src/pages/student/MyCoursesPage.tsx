import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useMyEnrollments } from '@/features/enrollments/hooks'

export function MyCoursesPage() {
  const { data, isLoading } = useMyEnrollments()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mes formations</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState
            title="Vous n'êtes inscrit à aucune formation"
            description="Parcourez le catalogue pour commencer à apprendre."
          />
        )}

        {data && data.length > 0 && (
          <div className="flex flex-col gap-3">
            {data.map((enrollment) => (
              <Link
                key={enrollment.id}
                to={`/student/courses/${enrollment.course.id}/player`}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:shadow-md"
              >
                <div>
                  <p className="font-medium text-slate-900">{enrollment.course.title}</p>
                  <p className="text-sm text-slate-500">
                    {enrollment.course.instructor.full_name} · {enrollment.course.category.name}
                  </p>
                </div>
                <Badge tone={enrollment.completed_at ? 'success' : 'brand'}>
                  {enrollment.completed_at ? 'Terminée' : 'En cours'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        to="/student/discover"
        className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
      >
        Découvrir plus de formations
      </Link>
    </div>
  )
}
