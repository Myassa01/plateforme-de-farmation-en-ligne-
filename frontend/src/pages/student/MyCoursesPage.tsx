import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useMyEnrollments } from '@/features/enrollments/hooks'
import { levelLabels } from '@/features/courses/utils'
import { resolveMediaUrl } from '@/utils/media'

export function MyCoursesPage() {
  const { data, isLoading } = useMyEnrollments()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mes formations</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
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
                className="group flex gap-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md sm:p-4"
              >
                <div className="aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-32">
                  {enrollment.course.thumbnail_url ? (
                    <img
                      src={resolveMediaUrl(enrollment.course.thumbnail_url) ?? undefined}
                      alt={enrollment.course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      Pas d'image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center gap-1 min-w-0">
                  <h2 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-600">
                    {enrollment.course.title}
                  </h2>
                  <p className="truncate text-sm text-slate-500">
                    {enrollment.course.instructor.full_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {enrollment.course.category.name} · {levelLabels[enrollment.course.level]}
                  </p>
                </div>

                <div className="flex shrink-0 items-center">
                  <Badge tone={enrollment.completed_at ? 'success' : 'brand'}>
                    {enrollment.completed_at ? 'Terminée' : 'En cours'}
                  </Badge>
                </div>
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
