import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { useCurriculum } from '@/features/curriculum/hooks'
import type { Lesson } from '@/features/curriculum/types'
import { useCompleteLesson, useCourseProgress } from '@/features/player/hooks'
import { clsx } from '@/utils/clsx'

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: sections, isLoading } = useCurriculum(courseId)
  const { data: progress } = useCourseProgress(courseId)
  const completeLesson = useCompleteLesson(courseId ?? '')

  const allLessons = useMemo(() => sections?.flatMap((section) => section.lessons) ?? [], [sections])
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  if (!courseId) return null

  const activeLesson: Lesson | undefined =
    allLessons.find((lesson) => lesson.id === activeLessonId) ?? allLessons[0]

  const completedIds = new Set(progress?.completed_lesson_ids ?? [])
  const activeIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson?.id)
  const previousLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : undefined
  const nextLesson =
    activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : undefined

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <EmptyState
        title="Cette formation n'a pas encore de contenu"
        description="Revenez plus tard, l'instructeur est en train de préparer les lessons."
      />
    )
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        {progress && (
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{progress.percentage}%</span>
          </div>
        )}

        <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
          {activeLesson?.video_url ? (
            <video
              key={activeLesson.id}
              src={activeLesson.video_url}
              controls
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Aucune vidéo n'a encore été ajoutée pour cette lesson
            </div>
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold text-slate-900">{activeLesson?.title}</h1>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!previousLesson}
              onClick={() => previousLesson && setActiveLessonId(previousLesson.id)}
            >
              Précédent
            </Button>
            <Button
              variant="secondary"
              disabled={!nextLesson}
              onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
            >
              Suivant
            </Button>
          </div>

          {activeLesson && !completedIds.has(activeLesson.id) && (
            <Button
              variant="primary"
              isLoading={completeLesson.isPending}
              onClick={() => completeLesson.mutate(activeLesson.id)}
            >
              Marquer comme terminée
            </Button>
          )}
          {activeLesson && completedIds.has(activeLesson.id) && (
            <Badge tone="success">Terminée</Badge>
          )}
        </div>
      </div>

      <aside className="w-80 shrink-0">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Contenu de la formation</h2>
          <div className="mt-3 flex flex-col gap-4">
            {sections.map((section) => (
              <div key={section.id}>
                <p className="text-sm font-medium text-slate-700">{section.title}</p>
                <div className="mt-1 flex flex-col gap-1">
                  {section.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={clsx(
                        'flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm',
                        activeLesson?.id === lesson.id
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      <span>{lesson.title}</span>
                      {completedIds.has(lesson.id) && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/student/courses"
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Retour à mes formations
        </Link>
      </aside>
    </div>
  )
}
