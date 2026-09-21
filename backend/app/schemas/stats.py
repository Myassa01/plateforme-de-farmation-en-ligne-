from decimal import Decimal

from pydantic import BaseModel

from app.schemas.enrollment import EnrollmentOut
from app.schemas.course import CourseListItem


class StudentStats(BaseModel):
    courses_in_progress: int
    courses_completed: int
    certificates_count: int
    average_quiz_score: float
    continue_learning: list[EnrollmentOut]


class InstructorStats(BaseModel):
    total_courses: int
    published_courses: int
    pending_courses: int
    draft_courses: int
    total_students: int
    total_revenue: Decimal
    average_rating: float
    top_courses: list[CourseListItem]


class AdminStats(BaseModel):
    total_users: int
    total_students: int
    total_instructors: int
    total_courses: int
    pending_courses: int
    published_courses: int
    total_enrollments: int
    total_revenue: Decimal
    recent_pending_courses: list[CourseListItem]
