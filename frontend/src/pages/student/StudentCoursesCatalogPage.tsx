import { CourseCatalog } from '@/features/courses/components/CourseCatalog'

export function StudentCoursesCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-slate-900">Parcourir les formations</h1>
      <div className="mt-6">
        <CourseCatalog linkBasePath="/student/discover" />
      </div>
    </div>
  )
}
