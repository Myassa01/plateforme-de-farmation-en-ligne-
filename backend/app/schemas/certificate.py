import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.course import CourseListItem


class StudentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str


class CertificateCreate(BaseModel):
    student_id: uuid.UUID
    course_id: uuid.UUID
    issued_at: date | None = Field(default=None)


class CertificateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student: StudentSummary
    course: CourseListItem
    issued_at: date
    created_at: datetime


class CertificateSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    background_url: str | None = None
