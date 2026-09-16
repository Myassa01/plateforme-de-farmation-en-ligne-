import uuid

from pydantic import BaseModel


class CourseProgressOut(BaseModel):
    course_id: uuid.UUID
    total_lessons: int
    completed_lessons: int
    percentage: float
    completed_lesson_ids: list[uuid.UUID]
