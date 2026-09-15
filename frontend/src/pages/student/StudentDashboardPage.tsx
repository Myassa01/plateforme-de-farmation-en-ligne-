import { useAuth } from '@/hooks/useAuth'

export function StudentDashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Bonjour {user?.full_name}</h1>
      <p className="mt-2 text-slate-600">
        Voici votre tableau de bord. Les cours en cours, la progression et les recommandations
        arriveront en Phase 4.
      </p>
    </div>
  )
}
