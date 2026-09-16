import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useAdminUsers, useToggleUserActive, useUpdateUserRole } from '@/features/admin/hooks'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/user'

const roleLabels: Record<UserRole, string> = {
  student: 'Étudiant',
  instructor: 'Instructeur',
  admin: 'Admin',
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { data, isLoading } = useAdminUsers()
  const updateRole = useUpdateUserRole()
  const toggleActive = useToggleUserActive()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
      <p className="mt-1 text-sm text-slate-600">
        Promouvez un étudiant en instructeur ou désactivez un compte.
      </p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState title="Aucun utilisateur trouvé" />
        )}

        {data && data.items.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{user.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={isSelf || updateRole.isPending}
                          onChange={(event) =>
                            updateRole.mutate({
                              userId: user.id,
                              role: event.target.value as UserRole,
                            })
                          }
                          className="rounded-lg border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Actif' : 'Désactivé'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          disabled={isSelf}
                          isLoading={toggleActive.isPending}
                          onClick={() =>
                            toggleActive.mutate({ userId: user.id, activate: !user.is_active })
                          }
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
