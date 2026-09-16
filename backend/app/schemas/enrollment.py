import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.course import CourseListItem


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course: CourseListItem
    enrolled_at: datetime
    completed_at: datetime | None
