import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.types import GUID

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.section import Section


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    section_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    video_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_preview: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    section: Mapped["Section"] = relationship(back_populates="lessons")
    quiz: Mapped["Quiz | None"] = relationship(cascade="all, delete-orphan", uselist=False)
