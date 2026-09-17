import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PublicNavbar } from '@/components/layout/PublicNavbar'

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

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
