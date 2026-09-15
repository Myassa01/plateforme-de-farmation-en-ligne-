import uuid
from datetime import datetime
from enum import Enum

from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.database.types import GUID

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"


def _enum_values(enum_cls: type[Enum]) -> list[str]:
    return [member.value for member in enum_cls]


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    instructor_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("categories.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    level: Mapped[CourseLevel] = mapped_column(
        SAEnum(CourseLevel, name="course_level", values_callable=_enum_values), nullable=False
    )
    language: Mapped[str] = mapped_column(String(50), nullable=False, default="French")
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)

    status: Mapped[CourseStatus] = mapped_column(
        SAEnum(CourseStatus, name="course_status", values_callable=_enum_values),
        nullable=False,
        default=CourseStatus.DRAFT,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    instructor: Mapped["User"] = relationship(lazy="joined")
    category: Mapped["Category"] = relationship(lazy="joined")
