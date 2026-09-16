import { Link } from 'react-router-dom'
import { CourseCatalog } from '@/features/courses/components/CourseCatalog'

export function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-brand-600">
          LearnHub
        </Link>
        <Link to="/login" className="text-sm font-medium text-slate-700 hover:underline">
          Se connecter
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Toutes les formations</h1>
        <div className="mt-6">
          <CourseCatalog />
        </div>
      </div>
    </div>
  )
}
