import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import {
  useCreateLesson,
  useCreateSection,
  useCurriculumEditor,
  useDeleteLesson,
  useDeleteSection,
} from '@/features/curriculum/hooks'
import { LessonVideoUploader } from '@/features/curriculum/components/LessonVideoUploader'
import { QuizBuilderPanel } from '@/features/quiz/components/QuizBuilderPanel'

export function CourseCurriculumPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: sections, isLoading } = useCurriculumEditor(courseId)
  const createSection = useCreateSection(courseId ?? '')
  const deleteSection = useDeleteSection(courseId ?? '')
  const createLesson = useCreateLesson(courseId ?? '')
  const deleteLesson = useDeleteLesson(courseId ?? '')

  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [lessonDrafts, setLessonDrafts] = useState<
    Record<string, { title: string; isPreview: boolean }>
  >({})
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)
  const [expandedQuizLessonId, setExpandedQuizLessonId] = useState<string | null>(null)

  if (!courseId) return null

  const handleAddSection = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newSectionTitle.trim()) return
    createSection.mutate(
      { title: newSectionTitle },
      { onSuccess: () => setNewSectionTitle('') },
    )
  }

  const handleAddLesson = (sectionId: string) => {
    const draft = lessonDrafts[sectionId]
    const title = draft?.title.trim()
    if (!title) return
    createLesson.mutate(
      {
        sectionId,
        payload: {
          title,
          is_preview: draft.isPreview,
        },
      },
      {
        onSuccess: () => {
          setLessonDrafts((prev) => ({
            ...prev,
            [sectionId]: { title: '', isPreview: false },
          }))
          setAddingLessonTo(null)
        },
      },
    )
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Curriculum de la formation</h1>
      <p className="mt-1 text-sm text-slate-600">
        Organisez votre formation en sections, lessons et quiz.
      </p>

      <div className="mt-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        )}

        {sections && sections.length === 0 && (
          <EmptyState
            title="Aucune section pour le moment"
            description="Ajoutez une première section pour commencer à structurer votre formation."
          />
        )}

        {sections && sections.length > 0 && (
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">{section.title}</h2>
                  <Button
                    variant="ghost"
                    isLoading={deleteSection.isPending}
                    onClick={() => deleteSection.mutate(section.id)}
                  >
                    Supprimer la section
                  </Button>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-lg bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="py-1! text-xs"
                            onClick={() =>
                              setExpandedQuizLessonId(
                                expandedQuizLessonId === lesson.id ? null : lesson.id,
                              )
                            }
                          >
                            {lesson.quiz ? 'Quiz' : '+ Quiz'}
                          </Button>
                          <Button
                            variant="ghost"
                            className="py-1! text-xs"
                            isLoading={deleteLesson.isPending}
                            onClick={() => deleteLesson.mutate(lesson.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      <LessonVideoUploader
                        courseId={courseId}
                        lessonId={lesson.id}
                        hasVideo={Boolean(lesson.video_url)}
                      />

                      {expandedQuizLessonId === lesson.id && (
                        <QuizBuilderPanel
                          courseId={courseId}
                          lessonId={lesson.id}
                          quiz={lesson.quiz}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {addingLessonTo === section.id ? (
                  <div className="mt-3 flex flex-col gap-2 rounded-md bg-slate-50 p-3">
                    <input
                      type="text"
                      value={lessonDrafts[section.id]?.title ?? ''}
                      onChange={(event) =>
                        setLessonDrafts((prev) => ({
                          ...prev,
                          [section.id]: {
                            title: event.target.value,
                            isPreview: prev[section.id]?.isPreview ?? false,
                          },
                        }))
                      }
                      placeholder="Titre de la lesson"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <p className="text-xs text-slate-500">
                      Vous pourrez importer la vidéo depuis votre ordinateur une fois la lesson
                      créée.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={lessonDrafts[section.id]?.isPreview ?? false}
                        onChange={(event) =>
                          setLessonDrafts((prev) => ({
                            ...prev,
                            [section.id]: {
                              title: prev[section.id]?.title ?? '',
                              isPreview: event.target.checked,
                            },
                          }))
                        }
                      />
                      Aperçu gratuit (visible sans inscription)
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        isLoading={createLesson.isPending}
                        onClick={() => handleAddLesson(section.id)}
                      >
                        Ajouter
                      </Button>
                      <Button variant="ghost" onClick={() => setAddingLessonTo(null)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onClick={() => setAddingLessonTo(section.id)}
                  >
                    + Ajouter une lesson
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAddSection} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(event) => setNewSectionTitle(event.target.value)}
          placeholder="Titre de la nouvelle section"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <Button type="submit" isLoading={createSection.isPending}>
          Ajouter une section
        </Button>
      </form>
    </div>
  )
}
