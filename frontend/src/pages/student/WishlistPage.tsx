import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { CourseCard } from '@/features/courses/components/CourseCard'
import { useWishlist } from '@/features/wishlist/hooks'

export function WishlistPage() {
  const { data, isLoading } = useWishlist()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Mes favoris</h1>

      <div className="mt-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <EmptyState
            title="Aucun favori pour le moment"
            description="Ajoutez des formations à vos favoris pour les retrouver ici."
          />
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <CourseCard
                key={item.id}
                course={item.course}
                linkBasePath="/student/discover"
                showWishlistToggle
              />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/student/discover"
        className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
      >
        Parcourir plus de formations
      </Link>
    </div>
  )
}
