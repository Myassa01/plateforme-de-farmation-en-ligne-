import { useSearchParams } from 'react-router-dom'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { CourseCatalog } from '@/features/courses/components/CourseCatalog'

export function CoursesPage() {
  const [searchParams] = useSearchParams()

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar initialSearch={searchParams.get('search') ?? ''} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Toutes les formations</h1>
        <div className="mt-6">
          <CourseCatalog />
        </div>
      </div>
    </div>
  )
}
