import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.types import GUID

if TYPE_CHECKING:
    from app.models.quiz_attempt import QuizAttempt


class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    selected_answer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("answers.id", ondelete="CASCADE"), nullable=False
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    attempt: Mapped["QuizAttempt"] = relationship(back_populates="attempt_answers")
