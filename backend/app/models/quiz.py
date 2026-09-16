import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.types import GUID

if TYPE_CHECKING:
    from app.models.question import Question


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True, unique=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, default=70)

    questions: Mapped[list["Question"]] = relationship(
        back_populates="quiz", order_by="Question.order_index", cascade="all, delete-orphan"
    )
