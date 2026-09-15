import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import type { CourseListItem } from '../types'
import { formatPrice, levelLabels } from '../utils'

interface CourseCardProps {
  course: CourseListItem
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
    >
      <div className="aspect-video w-full bg-slate-100">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Pas d'image
          </div>
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
