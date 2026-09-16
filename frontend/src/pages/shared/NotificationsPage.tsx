import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useMarkNotificationRead, useNotifications } from '@/features/notifications/hooks'
import { clsx } from '@/utils/clsx'

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return "À l'instant"
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Il y a ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  return `Il y a ${diffDays} j`
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markAsRead = useMarkNotificationRead()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && <EmptyState title="Aucune notification pour le moment" />}

        {data && data.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.map((notification) => (
              <button
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                className={clsx(
                  'flex flex-col items-start gap-1 rounded-lg p-4 text-left shadow-sm ring-1 ring-slate-200',
                  notification.is_read ? 'bg-white' : 'bg-brand-50',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <p className="font-medium text-slate-900">{notification.title}</p>
                  <span className="text-xs text-slate-400">{timeAgo(notification.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600">{notification.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
