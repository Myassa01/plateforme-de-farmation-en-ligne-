import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.course import CourseLevel, CourseStatus


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    category_id: uuid.UUID
    level: CourseLevel
    language: str = Field(default="French", max_length=50)
    price: Decimal = Field(default=Decimal("0"), ge=0)
    thumbnail_url: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    category_id: uuid.UUID | None = None
    level: CourseLevel | None = None
    language: str | None = Field(default=None, max_length=50)
    price: Decimal | None = Field(default=None, ge=0)
    thumbnail_url: str | None = None


class CourseReject(BaseModel):
    reason: str = Field(min_length=3)


class InstructorSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str


class CategorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    description: str
    thumbnail_url: str | None
    level: CourseLevel
    language: str
    price: Decimal
    status: CourseStatus
    rejection_reason: str | None
    instructor: InstructorSummary
    category: CategorySummary
    created_at: datetime
    updated_at: datetime


class CourseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    thumbnail_url: str | None
    level: CourseLevel
    language: str
    price: Decimal
    status: CourseStatus
    instructor: InstructorSummary
    category: CategorySummary


class PaginatedCourses(BaseModel):
    items: list[CourseListItem]
    total: int
    page: int
    page_size: int
