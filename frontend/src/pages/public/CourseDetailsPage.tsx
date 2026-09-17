import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { CourseDetailsContent } from '@/features/courses/components/CourseDetailsContent'

export function CourseDetailsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <CourseDetailsContent />
      </div>
    </div>
  )
}
