import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { StatCard } from '@/components/StatCard'
import { useInstructorStats } from '@/features/stats/hooks'
import { useAuth } from '@/hooks/useAuth'
import { resolveMediaUrl } from '@/utils/media'

const statusTone: Record<string, 'success' | 'warning' | 'neutral' | 'danger'> = {
  published: 'success',
  pending: 'warning',
  draft: 'neutral',
  rejected: 'danger',
}

const statusLabel: Record<string, string> = {
  published: 'Publiée',
  pending: 'En attente',
  draft: 'Brouillon',
  rejected: 'Rejetée',
}

export function InstructorDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useInstructorStats()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-slate-500">
            Aperçu de votre activité d'instructeur, {user?.full_name}.
          </p>
        </div>
        <Link to="/instructor/courses/new">
          <Button variant="primary">+ Nouvelle formation</Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Formations"
              value={stats?.total_courses ?? 0}
              hint={`${stats?.published_courses ?? 0} publiées · ${stats?.pending_courses ?? 0} en attente · ${stats?.draft_courses ?? 0} brouillons`}
              tone="brand"
              icon={<span aria-hidden>📚</span>}
            />
            <StatCard
              label="Étudiants inscrits"
              value={stats?.total_students ?? 0}
              tone="accent"
              icon={<span aria-hidden>🎓</span>}
            />
            <StatCard
              label="Revenus générés"
              value={`${stats?.total_revenue ?? 0} €`}
              tone="warning"
              icon={<span aria-hidden>💰</span>}
            />
            <StatCard
              label="Note moyenne"
              value={stats?.average_rating ? `${stats.average_rating} / 5` : '—'}
              tone="neutral"
              icon={<span aria-hidden>⭐</span>}
            />
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Vos formations publiées</h2>
          <Link to="/instructor/courses" className="text-sm font-medium text-brand-600 hover:underline">
            Gérer toutes mes formations →
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

          {stats && stats.top_courses.length === 0 && (
            <EmptyState
              title="Aucune formation publiée"
              description="Créez une formation et soumettez-la pour validation afin qu'elle apparaisse ici."
            />
          )}

          {stats && stats.top_courses.length > 0 && (
            <div className="flex flex-col gap-3">
              {stats.top_courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/instructor/courses/${course.id}/curriculum`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 transition-colors hover:bg-accent-50 hover:ring-accent-200"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      {course.thumbnail_url ? (
                        <img
                          src={resolveMediaUrl(course.thumbnail_url) ?? undefined}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-brand-600 text-sm font-bold text-white">
                          {course.title.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">{course.category.name}</p>
                    </div>
                  </div>
                  <Badge tone={statusTone[course.status]}>{statusLabel[course.status]}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
