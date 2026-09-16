import { clsx } from '@/utils/clsx'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const isInteractive = Boolean(onChange)
  const starSize = size === 'sm' ? 'text-sm' : 'text-lg'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => onChange?.(star)}
          className={clsx(
            starSize,
            isInteractive ? 'cursor-pointer' : 'cursor-default',
            star <= value ? 'text-amber-400' : 'text-slate-300',
          )}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
