import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { StatCard } from '@/components/StatCard'
import { useStudentStats } from '@/features/stats/hooks'
import { resolveMediaUrl } from '@/utils/media'

export function StudentDashboardPage() {
  const { data: stats, isLoading } = useStudentStats()

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">
          Voici un résumé de votre progression sur LearnHub.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Formations en cours"
              value={stats?.courses_in_progress ?? 0}
              tone="brand"
              icon={<span aria-hidden>📚</span>}
            />
            <StatCard
              label="Formations terminées"
              value={stats?.courses_completed ?? 0}
              tone="accent"
              icon={<span aria-hidden>✅</span>}
            />
            <StatCard
              label="Certificats obtenus"
              value={stats?.certificates_count ?? 0}
              tone="warning"
              icon={<span aria-hidden>🏆</span>}
            />
            <StatCard
              label="Score moyen aux quiz"
              value={`${stats?.average_quiz_score ?? 0}%`}
              tone="neutral"
              icon={<span aria-hidden>📝</span>}
            />
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Continuer l'apprentissage</h2>
          <Link to="/student/courses" className="text-sm font-medium text-brand-600 hover:underline">
            Voir toutes mes formations →
          </Link>
        </div>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          )}

          {stats && stats.continue_learning.length === 0 && (
            <EmptyState
              title="Aucune formation en cours"
              description="Inscrivez-vous à une formation pour commencer à apprendre."
            />
          )}

          {stats && stats.continue_learning.length > 0 && (
            <div className="flex flex-col gap-3">
              {stats.continue_learning.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  to={`/student/courses/${enrollment.course.id}/player`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 transition-colors hover:bg-brand-50 hover:ring-brand-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      {enrollment.course.thumbnail_url ? (
                        <img
                          src={resolveMediaUrl(enrollment.course.thumbnail_url) ?? undefined}
                          alt={enrollment.course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 text-sm font-bold text-white">
                          {enrollment.course.title.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{enrollment.course.title}</p>
                      <p className="text-sm text-slate-500">
                        {enrollment.course.instructor.full_name} · {enrollment.course.category.name}
                      </p>
                    </div>
                  </div>
                  <Badge tone="brand">En cours</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {stats && stats.courses_in_progress === 0 && stats.courses_completed === 0 && (
          <Link
            to="/student/discover"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            Découvrir des formations →
          </Link>
        )}
      </div>
    </div>
  )
}
