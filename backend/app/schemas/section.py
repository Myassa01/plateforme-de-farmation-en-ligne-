import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.lesson import LessonOut


class SectionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)


class SectionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    order_index: int | None = None


class SectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    order_index: int


class SectionWithLessonsOut(SectionOut):
    lessons: list[LessonOut]
