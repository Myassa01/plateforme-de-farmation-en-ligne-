import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCategories } from '@/features/categories/useCategories'
import { CourseCard } from '@/features/courses/components/CourseCard'
import { useCourses } from '@/features/courses/hooks/useCourses'
import type { CourseFilters, CourseLevel } from '@/features/courses/types'
import { levelLabels } from '@/features/courses/utils'

const levels: CourseLevel[] = ['beginner', 'intermediate', 'advanced']

export function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({ page: 1, page_size: 12 })
  const [searchInput, setSearchInput] = useState('')

  const { data: categories } = useCategories()
  const { data, isLoading, isError } = useCourses(filters)

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }))
  }

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

        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Rechercher
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category_id: undefined, page: 1 }))}
            className={filters.category_id ? '' : 'contents'}
          >
            <Badge tone={filters.category_id ? 'neutral' : 'brand'}>Toutes catégories</Badge>
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setFilters((prev) => ({ ...prev, category_id: category.id, page: 1 }))
              }
            >
              <Badge tone={filters.category_id === category.id ? 'brand' : 'neutral'}>
                {category.name}
              </Badge>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  level: prev.level === level ? undefined : level,
                  page: 1,
                }))
              }
            >
              <Badge tone={filters.level === level ? 'brand' : 'neutral'}>
                {levelLabels[level]}
              </Badge>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <EmptyState
              title="Impossible de charger les formations"
              description="Vérifiez votre connexion et réessayez."
            />
          )}

          {data && data.items.length === 0 && (
            <EmptyState
              title="Aucune formation trouvée"
              description="Essayez de modifier vos critères de recherche."
            />
          )}

          {data && data.items.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
