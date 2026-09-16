import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quizApi } from './api'
import type { CreateQuestionPayload, CreateQuizPayload } from './types'

export function useQuizForAttempt(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz-attempt', quizId],
    queryFn: () => quizApi.getForAttempt(quizId as string),
    enabled: Boolean(quizId),
  })
}

export function useSubmitQuiz(quizId: string) {
  return useMutation({
    mutationFn: (answers: { question_id: string; selected_answer_id: string }[]) =>
      quizApi.submit(quizId, answers),
  })
}

export function useQuizAttempt(quizId: string | undefined, attemptId: string | undefined) {
  return useQuery({
    queryKey: ['quiz-result', quizId, attemptId],
    queryFn: () => quizApi.getAttempt(quizId as string, attemptId as string),
    enabled: Boolean(quizId) && Boolean(attemptId),
  })
}

function invalidateCurriculum(queryClient: ReturnType<typeof useQueryClient>, courseId: string) {
  queryClient.invalidateQueries({ queryKey: ['curriculum', courseId] })
  queryClient.invalidateQueries({ queryKey: ['curriculum-editor', courseId] })
}

export function useCreateQuiz(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: CreateQuizPayload }) =>
      quizApi.createQuiz(lessonId, payload),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useDeleteQuiz(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quizId: string) => quizApi.deleteQuiz(quizId),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useAddQuestion(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: CreateQuestionPayload }) =>
      quizApi.addQuestion(quizId, payload),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}

export function useDeleteQuestion(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (questionId: string) => quizApi.deleteQuestion(questionId),
    onSuccess: () => invalidateCurriculum(queryClient, courseId),
  })
}
