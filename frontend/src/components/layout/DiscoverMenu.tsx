import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '@/features/categories/useCategories'
import { clsx } from '@/utils/clsx'

export function DiscoverMenu() {
  const { data: categories } = useCategories()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          'text-sm font-medium hover:text-brand-600',
          isOpen ? 'text-brand-600' : 'text-slate-700',
        )}
      >
        Découvrir
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
          <Link
            to="/courses"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Toutes les formations
          </Link>

          {categories && categories.length > 0 && (
            <div className="mt-1 border-t border-slate-100 pt-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/courses?category_id=${category.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {category.name}
                  <span className="text-slate-400">›</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
