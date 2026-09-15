import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCourse } from '@/features/courses/hooks/useCourse'
import { formatPrice, levelLabels } from '@/features/courses/utils'
import { useAuth } from '@/hooks/useAuth'

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading, isError } = useCourse(courseId)
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
        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <EmptyState
            title="Formation introuvable"
            description="Cette formation n'existe pas ou n'est plus disponible."
          />
        )}

        {course && (
          <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{course.category.name}</Badge>
              <Badge>{levelLabels[course.level]}</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-2 text-slate-600">Par {course.instructor.full_name}</p>

            <p className="mt-6 whitespace-pre-line text-slate-700">{course.description}</p>

            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(course.price)}
              </span>
              <Button variant="primary">S'inscrire</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
