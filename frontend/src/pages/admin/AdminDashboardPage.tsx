import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { StatCard } from '@/components/StatCard'
import { useAdminStats } from '@/features/stats/hooks'
import { resolveMediaUrl } from '@/utils/media'

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de la plateforme LearnHub.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Utilisateurs"
              value={stats?.total_users ?? 0}
              hint={`${stats?.total_students ?? 0} étudiants · ${stats?.total_instructors ?? 0} instructeurs`}
              tone="brand"
              icon={<span aria-hidden>👥</span>}
            />
            <StatCard
              label="Formations"
              value={stats?.total_courses ?? 0}
              hint={`${stats?.published_courses ?? 0} publiées · ${stats?.pending_courses ?? 0} en attente`}
              tone="accent"
              icon={<span aria-hidden>📚</span>}
            />
            <StatCard
              label="Inscriptions totales"
              value={stats?.total_enrollments ?? 0}
              tone="neutral"
              icon={<span aria-hidden>🎓</span>}
            />
            <StatCard
              label="Revenus de la plateforme"
              value={`${stats?.total_revenue ?? 0} €`}
              tone="warning"
              icon={<span aria-hidden>💰</span>}
            />
          </>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Formations en attente de validation</h2>
          <Link to="/admin/courses" className="text-sm font-medium text-brand-600 hover:underline">
            Gérer toutes les formations →
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

          {stats && stats.recent_pending_courses.length === 0 && (
            <EmptyState
              title="Aucune formation en attente"
              description="Toutes les formations soumises ont été traitées."
            />
          )}

          {stats && stats.recent_pending_courses.length > 0 && (
            <div className="flex flex-col gap-3">
              {stats.recent_pending_courses.map((course) => (
                <Link
                  key={course.id}
                  to="/admin/courses"
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 transition-colors hover:bg-amber-50 hover:ring-amber-200"
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
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-brand-600 text-sm font-bold text-white">
                          {course.title.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{course.title}</p>
                      <p className="text-sm text-slate-500">
                        {course.instructor.full_name} · {course.category.name}
                      </p>
                    </div>
                  </div>
                  <Badge tone="warning">En attente</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
