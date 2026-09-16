import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, ForbiddenError, NotFoundError
from app.models.attempt_answer import AttemptAnswer
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.quiz_attempt_repository import QuizAttemptRepository
from app.repositories.quiz_repository import QuizRepository
from app.repositories.section_repository import SectionRepository
from app.schemas.quiz import QuizSubmission


class QuizAttemptService:
    def __init__(self, db: Session):
        self.db = db
        self.quiz_repo = QuizRepository(db)
        self.lesson_repo = LessonRepository(db)
        self.section_repo = SectionRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.attempt_repo = QuizAttemptRepository(db)

    def get_quiz_for_attempt(self, quiz_id: uuid.UUID, student_id: uuid.UUID) -> Quiz:
        quiz = self._get_quiz(quiz_id)
        self._ensure_enrolled(quiz, student_id)
        return quiz

    def submit_attempt(
        self, quiz_id: uuid.UUID, student_id: uuid.UUID, payload: QuizSubmission
    ) -> QuizAttempt:
        quiz = self._get_quiz(quiz_id)
        self._ensure_enrolled(quiz, student_id)

        questions_by_id = {question.id: question for question in quiz.questions}
        if len(payload.answers) != len(questions_by_id):
            raise ConflictError("You must answer every question")

        attempt_answers: list[AttemptAnswer] = []
        correct_count = 0

        for submitted in payload.answers:
            question = questions_by_id.get(submitted.question_id)
            if not question:
                raise NotFoundError("Question not found in this quiz")

            selected_answer = next(
                (a for a in question.answers if a.id == submitted.selected_answer_id), None
            )
            if not selected_answer:
                raise NotFoundError("Answer not found for this question")

            is_correct = selected_answer.is_correct
            if is_correct:
                correct_count += 1

            attempt_answers.append(
                AttemptAnswer(
                    question_id=question.id,
                    selected_answer_id=selected_answer.id,
                    is_correct=is_correct,
                )
            )

        score = round((correct_count / len(questions_by_id)) * 100) if questions_by_id else 0
        passed = score >= quiz.passing_score

        attempt = QuizAttempt(
            student_id=student_id,
            quiz_id=quiz.id,
            score=score,
            passed=passed,
        )
        attempt.attempt_answers = attempt_answers
        return self.attempt_repo.create(attempt)

    def list_attempts(self, quiz_id: uuid.UUID, student_id: uuid.UUID) -> list[QuizAttempt]:
        return self.attempt_repo.list_for_student_and_quiz(student_id, quiz_id)

    def get_attempt(self, attempt_id: uuid.UUID, student_id: uuid.UUID) -> QuizAttempt:
        attempt = self.attempt_repo.get_by_id(attempt_id)
        if not attempt:
            raise NotFoundError("Attempt not found")
        if attempt.student_id != student_id:
            raise ForbiddenError("You do not have permission to view this attempt")
        return attempt

    def _get_quiz(self, quiz_id: uuid.UUID) -> Quiz:
        quiz = self.quiz_repo.get_by_id(quiz_id)
        if not quiz:
            raise NotFoundError("Quiz not found")
        return quiz

    def _ensure_enrolled(self, quiz: Quiz, student_id: uuid.UUID) -> None:
        lesson = self.lesson_repo.get_by_id(quiz.lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        section = self.section_repo.get_by_id(lesson.section_id)
        if not section:
            raise NotFoundError("Section not found")

        if not self.enrollment_repo.get(student_id, section.course_id):
            raise ForbiddenError("You must be enrolled in this course to take the quiz")
