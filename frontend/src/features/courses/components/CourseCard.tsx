import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist/hooks'
import { resolveMediaUrl } from '@/utils/media'
import type { CourseListItem } from '../types'
import { formatPrice, levelLabels } from '../utils'

interface CourseCardProps {
  course: CourseListItem
  linkBasePath?: string
  showWishlistToggle?: boolean
}

export function CourseCard({ course, linkBasePath = '/courses', showWishlistToggle = false }: CourseCardProps) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const isStudent = user?.role === 'student'
  const canToggleWishlist = showWishlistToggle && (isStudent || !isAuthenticated)

  const { data: wishlist } = useWishlist(canToggleWishlist && isStudent)
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  const isWishlisted = wishlist?.some((item) => item.course.id === course.id) ?? false
  const isPending = addToWishlist.isPending || removeFromWishlist.isPending

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isWishlisted) {
      removeFromWishlist.mutate(course.id)
    } else {
      addToWishlist.mutate(course.id)
    }
  }

  return (
    <Link
      to={`${linkBasePath}/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-slate-100">
        {course.thumbnail_url ? (
          <img
            src={resolveMediaUrl(course.thumbnail_url) ?? undefined}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Pas d'image
          </div>
        )}
        {canToggleWishlist && (
          <button
            type="button"
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={handleToggleWishlist}
            disabled={isPending}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-105 disabled:opacity-60"
          >
            <span aria-hidden className={isWishlisted ? 'text-red-500' : 'text-slate-400'}>
              {isWishlisted ? '♥' : '♡'}
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge tone="brand">{course.category.name}</Badge>
        <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-600">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500">{course.instructor.full_name}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">{levelLabels[course.level]}</span>
          <span className="font-semibold text-slate-900">{formatPrice(course.price)}</span>
        </div>
      </div>
    </Link>
  )
}
