import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCourseStudents } from '../hooks'

interface CourseStudentsPanelProps {
  courseId: string
}

function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function CourseStudentsPanel({ courseId }: CourseStudentsPanelProps) {
  const { data: students, isLoading } = useCourseStudents(courseId)

  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Étudiants inscrits</h3>
        {students && (
          <span className="text-xs font-medium text-slate-500">
            {students.length} {students.length > 1 ? 'étudiants' : 'étudiant'}
          </span>
        )}
      </div>

      <div className="mt-3">
        {isLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        )}

        {students && students.length === 0 && (
          <EmptyState
            title="Aucun étudiant inscrit"
            description="Les étudiants inscrits à cette formation apparaîtront ici."
          />
        )}

        {students && students.length > 0 && (
          <div className="flex flex-col gap-2">
            {students.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-600 text-xs font-bold text-white">
                    {initials(enrollment.student.full_name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {enrollment.student.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{enrollment.student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Inscrit le {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
                  </span>
                  <Badge tone={enrollment.completed_at ? 'success' : 'brand'}>
                    {enrollment.completed_at ? 'Terminée' : 'En cours'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
