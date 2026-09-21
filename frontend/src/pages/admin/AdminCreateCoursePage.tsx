import { useNavigate } from 'react-router-dom'
import { CourseForm } from '@/features/courses/components/CourseForm'
import { useCreateCourse } from '@/features/courses/hooks/useCourseMutations'
import type { CreateCourseFormValues } from '@/features/courses/schemas'

export function AdminCreateCoursePage() {
  const navigate = useNavigate()
  const createCourse = useCreateCourse()

  const onSubmit = (values: CreateCourseFormValues) => {
    createCourse.mutate(values, {
      onSuccess: () => navigate('/admin/courses'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Créer une formation</h1>
      <p className="mt-1 text-sm text-slate-600">
        En tant qu'admin, vous pouvez créer une formation directement.
      </p>

      <div className="mt-6">
        <CourseForm
          onSubmit={onSubmit}
          isSubmitting={createCourse.isPending}
          submitError={createCourse.error?.message}
        />
      </div>
    </div>
  )
}
