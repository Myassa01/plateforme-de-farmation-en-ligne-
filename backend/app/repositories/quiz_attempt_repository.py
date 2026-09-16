import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.quiz_attempt import QuizAttempt


class QuizAttemptRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, attempt_id: uuid.UUID) -> QuizAttempt | None:
        return self.db.get(QuizAttempt, attempt_id)

    def list_for_student_and_quiz(self, student_id: uuid.UUID, quiz_id: uuid.UUID) -> list[QuizAttempt]:
        stmt = (
            select(QuizAttempt)
            .where(QuizAttempt.student_id == student_id, QuizAttempt.quiz_id == quiz_id)
            .order_by(QuizAttempt.attempted_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create(self, attempt: QuizAttempt) -> QuizAttempt:
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt
