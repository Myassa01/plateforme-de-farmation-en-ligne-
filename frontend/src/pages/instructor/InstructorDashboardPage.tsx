import { useAuth } from '@/hooks/useAuth'

export function InstructorDashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bonjour {user?.full_name}</h1>
      <p className="mt-2 text-slate-600">
        Vos formations, étudiants et statistiques apparaîtront ici en Phase 4.
      </p>
    </div>
  )
}
