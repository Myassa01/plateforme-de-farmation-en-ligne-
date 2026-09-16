import uuid

from pydantic import BaseModel, ConfigDict, Field


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    video_url: str | None = None
    duration_seconds: int = Field(default=0, ge=0)
    is_preview: bool = False


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    video_url: str | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    is_preview: bool | None = None
    order_index: int | None = None


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_id: uuid.UUID
    title: str
    video_url: str | None
    duration_seconds: int
    order_index: int
    is_preview: bool


class LessonProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lesson_id: uuid.UUID
    is_completed: bool
