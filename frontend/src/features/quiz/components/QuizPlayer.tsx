import { useState } from 'react'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Skeleton } from '@/components/Skeleton'
import { useQuizForAttempt, useSubmitQuiz } from '../hooks'

interface QuizPlayerProps {
  quizId: string
  onCompleted?: () => void
}

export function QuizPlayer({ quizId, onCompleted }: QuizPlayerProps) {
  const { data: quiz, isLoading } = useQuizForAttempt(quizId)
  const submitQuiz = useSubmitQuiz(quizId)
  const [selections, setSelections] = useState<Record<string, string>>({})

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!quiz) return null

  const allAnswered = quiz.questions.every((question) => selections[question.id])

  const handleSubmit = () => {
    const answers = quiz.questions.map((question) => ({
      question_id: question.id,
      selected_answer_id: selections[question.id],
    }))
    submitQuiz.mutate(answers, {
      onSuccess: () => onCompleted?.(),
    })
  }

  if (submitQuiz.data) {
    const result = submitQuiz.data
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Résultat du quiz</h3>
          <Badge tone={result.passed ? 'success' : 'danger'}>
            {result.passed ? 'Réussi' : 'Échoué'}
          </Badge>
        </div>
        <p className="mt-2 text-3xl font-bold text-slate-900">{result.score}%</p>
        <p className="mt-1 text-sm text-slate-500">
          Score minimum requis : {quiz.passing_score}%
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {quiz.questions.map((question) => {
            const answerResult = result.attempt_answers.find((a) => a.question_id === question.id)
            return (
              <div key={question.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-sm text-slate-800">{question.text}</p>
                <p
                  className={
                    answerResult?.is_correct ? 'text-sm text-green-600' : 'text-sm text-red-600'
                  }
                >
                  {answerResult?.is_correct ? 'Correct' : 'Incorrect'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">{quiz.title}</h3>
      <p className="mt-1 text-sm text-slate-500">Score minimum requis : {quiz.passing_score}%</p>

      <div className="mt-4 flex flex-col gap-4">
        {quiz.questions.map((question, index) => (
          <div key={question.id}>
            <p className="text-sm font-medium text-slate-800">
              {index + 1}. {question.text}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {question.answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selections[question.id] === answer.id}
                    onChange={() =>
                      setSelections((prev) => ({ ...prev, [question.id]: answer.id }))
                    }
                  />
                  {answer.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {submitQuiz.isError && (
        <p className="mt-3 text-sm text-red-600">{submitQuiz.error.message}</p>
      )}

      <Button
        variant="primary"
        className="mt-4"
        disabled={!allAnswered}
        isLoading={submitQuiz.isPending}
        onClick={handleSubmit}
      >
        Soumettre le quiz
      </Button>
    </div>
  )
}
