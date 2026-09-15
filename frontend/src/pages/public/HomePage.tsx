import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

export function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-brand-600">LearnHub</span>
        <div className="flex items-center gap-3">
          <Link to="/courses" className="text-sm font-medium text-slate-700 hover:underline">
            Formations
          </Link>
          {isAuthenticated ? (
            <Link to="/student">
              <Button variant="secondary">Mon tableau de bord</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">S'inscrire</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Apprenez à votre rythme avec <span className="text-brand-600">LearnHub</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Des formations créées par des instructeurs passionnés, un suivi de progression
          personnalisé et des certificats à la clé.
        </p>
        <Link to="/register" className="mt-8">
          <Button variant="primary">Commencer gratuitement</Button>
        </Link>
      </main>
    </div>
  )
}
