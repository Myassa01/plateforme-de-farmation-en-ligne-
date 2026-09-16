import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, ForbiddenError, NotFoundError
from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.user import User, UserRole
from app.repositories.course_repository import CourseRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.quiz_repository import QuizRepository
from app.repositories.section_repository import SectionRepository
from app.schemas.quiz import QuestionCreate, QuizCreate


class QuizBuilderService:
    def __init__(self, db: Session):
        self.db = db
        self.quiz_repo = QuizRepository(db)
        self.lesson_repo = LessonRepository(db)
        self.section_repo = SectionRepository(db)
        self.course_repo = CourseRepository(db)

    def create_quiz(self, lesson_id: uuid.UUID, current_user: User, payload: QuizCreate) -> Quiz:
        lesson = self._get_owned_lesson(lesson_id, current_user)

        if self.quiz_repo.get_by_lesson(lesson.id):
            raise ConflictError("This lesson already has a quiz")

        quiz = Quiz(lesson_id=lesson.id, title=payload.title, passing_score=payload.passing_score)
        return self.quiz_repo.create(quiz)

    def delete_quiz(self, quiz_id: uuid.UUID, current_user: User) -> None:
        quiz = self._get_quiz(quiz_id)
        self._get_owned_lesson(quiz.lesson_id, current_user)
        self.quiz_repo.delete(quiz)

    def add_question(self, quiz_id: uuid.UUID, current_user: User, payload: QuestionCreate) -> Question:
        quiz = self._get_quiz(quiz_id)
        self._get_owned_lesson(quiz.lesson_id, current_user)

        correct_count = sum(1 for answer in payload.answers if answer.is_correct)
        if correct_count != 1:
            raise ConflictError("A question must have exactly one correct answer")

        question = Question(
            quiz_id=quiz.id,
            text=payload.text,
            type=payload.type,
            order_index=self.quiz_repo.next_question_order_index(quiz.id),
        )
        question.answers = [
            Answer(text=answer.text, is_correct=answer.is_correct) for answer in payload.answers
        ]
        return self.quiz_repo.create_question(question)

    def delete_question(self, question_id: uuid.UUID, current_user: User) -> None:
        question = self.quiz_repo.get_question(question_id)
        if not question:
            raise NotFoundError("Question not found")

        quiz = self._get_quiz(question.quiz_id)
        self._get_owned_lesson(quiz.lesson_id, current_user)

        self.db.delete(question)
        self.db.commit()

    def _get_quiz(self, quiz_id: uuid.UUID) -> Quiz:
        quiz = self.quiz_repo.get_by_id(quiz_id)
        if not quiz:
            raise NotFoundError("Quiz not found")
        return quiz

    def _get_owned_lesson(self, lesson_id: uuid.UUID, current_user: User):
        lesson = self.lesson_repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        section = self.section_repo.get_by_id(lesson.section_id)
        if not section:
            raise NotFoundError("Section not found")

        course = self.course_repo.get_by_id(section.course_id)
        if not course:
            raise NotFoundError("Course not found")

        is_owner = current_user.id == course.instructor_id
        is_admin = current_user.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise ForbiddenError("You do not have permission to manage this course's quiz")

        return lesson
