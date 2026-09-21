import { useQuery } from '@tanstack/react-query'
import { enrollmentsApi } from './api'

export function useMyEnrollments(enabled = true) {
  return useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentsApi.listMine,
    enabled,
  })
}

export function useCourseStudents(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => enrollmentsApi.listForCourse(courseId as string),
    enabled: Boolean(courseId),
  })
}
