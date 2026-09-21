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


class EnrolledStudent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str


class CourseEnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student: EnrolledStudent
    enrolled_at: datetime
    completed_at: datetime | None
