import { useState } from 'react'
import { Button } from '@/components/Button'
import {
  useAddQuestion,
  useCreateQuiz,
  useDeleteQuestion,
  useDeleteQuiz,
} from '../hooks'
import type { QuestionType, QuizBuilder } from '../types'

interface QuizBuilderPanelProps {
  courseId: string
  lessonId: string
  quiz: QuizBuilder | null
}

interface DraftAnswer {
  text: string
  isCorrect: boolean
}

function emptyAnswers(): DraftAnswer[] {
  return [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ]
}

export function QuizBuilderPanel({ courseId, lessonId, quiz }: QuizBuilderPanelProps) {
  const createQuiz = useCreateQuiz(courseId)
  const deleteQuiz = useDeleteQuiz(courseId)
  const addQuestion = useAddQuestion(courseId)
  const deleteQuestion = useDeleteQuestion(courseId)

  const [quizTitle, setQuizTitle] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice')
  const [questionText, setQuestionText] = useState('')
  const [answers, setAnswers] = useState<DraftAnswer[]>(emptyAnswers())

  const resetQuestionForm = () => {
    setQuestionText('')
    setAnswers(emptyAnswers())
    setQuestionType('multiple_choice')
    setIsAddingQuestion(false)
  }

  const handleCreateQuiz = (event: React.FormEvent) => {
    event.preventDefault()
    if (!quizTitle.trim()) return
    createQuiz.mutate({ lessonId, payload: { title: quizTitle } }, { onSuccess: () => setQuizTitle('') })
  }

  const handleTypeChange = (type: QuestionType) => {
    setQuestionType(type)
    if (type === 'true_false') {
      setAnswers([
        { text: 'Vrai', isCorrect: true },
        { text: 'Faux', isCorrect: false },
      ])
    } else {
      setAnswers(emptyAnswers())
    }
  }

  const handleAddAnswerOption = () => {
    setAnswers((prev) => [...prev, { text: '', isCorrect: false }])
  }

  const handleAddQuestion = () => {
    if (!quiz) return
    if (!questionText.trim() || answers.some((a) => !a.text.trim())) return

    addQuestion.mutate(
      {
        quizId: quiz.id,
        payload: {
          text: questionText,
          type: questionType,
          answers: answers.map((a) => ({ text: a.text, is_correct: a.isCorrect })),
        },
      },
      { onSuccess: resetQuestionForm },
    )
  }

  if (!quiz) {
    return (
      <form onSubmit={handleCreateQuiz} className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
        <input
          type="text"
          value={quizTitle}
          onChange={(event) => setQuizTitle(event.target.value)}
          placeholder="Titre du quiz"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <Button variant="secondary" type="submit" isLoading={createQuiz.isPending}>
          Créer un quiz
        </Button>
      </form>
    )
  }

  return (
    <div className="mt-3 rounded-lg bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">Quiz : {quiz.title}</p>
        <Button
          variant="ghost"
          className="py-1! text-xs"
          isLoading={deleteQuiz.isPending}
          onClick={() => deleteQuiz.mutate(quiz.id)}
        >
          Supprimer le quiz
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {quiz.questions.map((question) => (
          <div key={question.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
            <div>
              <p className="text-sm text-slate-800">{question.text}</p>
              <p className="text-xs text-slate-500">
                {question.answers.find((a) => a.is_correct)?.text}
              </p>
            </div>
            <Button
              variant="ghost"
              className="py-1! text-xs"
              isLoading={deleteQuestion.isPending}
              onClick={() => deleteQuestion.mutate(question.id)}
            >
              Supprimer
            </Button>
          </div>
        ))}
      </div>

      {isAddingQuestion ? (
        <div className="mt-3 flex flex-col gap-2 rounded-md bg-white p-3">
          <input
            type="text"
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
            placeholder="Texte de la question"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          <select
            value={questionType}
            onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
            className="w-fit rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="multiple_choice">Choix multiple</option>
            <option value="true_false">Vrai / Faux</option>
          </select>

          <div className="flex flex-col gap-2">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={answer.isCorrect}
                  onChange={() =>
                    setAnswers((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === index })))
                  }
                />
                <input
                  type="text"
                  value={answer.text}
                  disabled={questionType === 'true_false'}
                  onChange={(event) =>
                    setAnswers((prev) =>
                      prev.map((a, i) =>
                        i === index ? { ...a, text: event.target.value } : a,
                      ),
                    )
                  }
                  placeholder={`Réponse ${index + 1}`}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100"
                />
              </div>
            ))}
          </div>

          {questionType === 'multiple_choice' && (
            <Button variant="ghost" className="w-fit text-xs" onClick={handleAddAnswerOption}>
              + Ajouter une option
            </Button>
          )}

          <div className="mt-1 flex gap-2">
            <Button variant="ghost" onClick={resetQuestionForm}>
              Annuler
            </Button>
            <Button variant="secondary" isLoading={addQuestion.isPending} onClick={handleAddQuestion}>
              Ajouter la question
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" className="mt-3" onClick={() => setIsAddingQuestion(true)}>
          + Ajouter une question
        </Button>
      )}
    </div>
  )
}
