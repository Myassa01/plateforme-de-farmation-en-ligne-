import { apiClient } from '@/services/apiClient'
import type {
  CreateQuestionPayload,
  CreateQuizPayload,
  QuestionBuilder,
  QuizAttemptResult,
  QuizBuilder,
  QuizForAttempt,
} from './types'

export const quizApi = {
  createQuiz: (lessonId: string, payload: CreateQuizPayload) =>
    apiClient.post<QuizBuilder>(`/lessons/${lessonId}/quizzes`, payload).then((res) => res.data),

  deleteQuiz: (quizId: string) => apiClient.delete(`/quizzes/${quizId}`),

  addQuestion: (quizId: string, payload: CreateQuestionPayload) =>
    apiClient
      .post<QuestionBuilder>(`/quizzes/${quizId}/questions`, payload)
      .then((res) => res.data),

  deleteQuestion: (questionId: string) => apiClient.delete(`/questions/${questionId}`),

  getForAttempt: (quizId: string) =>
    apiClient.get<QuizForAttempt>(`/quizzes/${quizId}`).then((res) => res.data),

  submit: (quizId: string, answers: { question_id: string; selected_answer_id: string }[]) =>
    apiClient
      .post<QuizAttemptResult>(`/quizzes/${quizId}/submit`, { answers })
      .then((res) => res.data),

  getAttempt: (quizId: string, attemptId: string) =>
    apiClient
      .get<QuizAttemptResult>(`/quizzes/${quizId}/attempts/${attemptId}`)
      .then((res) => res.data),
}
