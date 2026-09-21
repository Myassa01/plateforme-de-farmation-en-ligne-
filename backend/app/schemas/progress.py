import uuid

from pydantic import BaseModel, Field


class CourseProgressOut(BaseModel):
    course_id: uuid.UUID
    total_lessons: int
    completed_lessons: int
    percentage: float
    completed_lesson_ids: list[uuid.UUID]
    watched_seconds_by_lesson: dict[uuid.UUID, int] = Field(default_factory=dict)


class LessonWatchProgressUpdate(BaseModel):
    watched_seconds: int = Field(ge=0)
