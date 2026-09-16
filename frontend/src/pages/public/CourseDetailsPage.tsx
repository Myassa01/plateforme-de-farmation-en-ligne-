import { Link } from 'react-router-dom'
import { CourseDetailsContent } from '@/features/courses/components/CourseDetailsContent'
import { useAuth } from '@/hooks/useAuth'

export function CourseDetailsPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-brand-600">
          LearnHub
        </Link>
        {!isAuthenticated && (
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:underline">
            Se connecter
          </Link>
        )}
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <CourseDetailsContent />
      </div>
    </div>
  )
}
