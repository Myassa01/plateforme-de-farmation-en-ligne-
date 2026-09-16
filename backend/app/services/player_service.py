import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ForbiddenError, NotFoundError
from app.models.course import CourseStatus
from app.models.section import Section
from app.models.user import User, UserRole
from app.repositories.course_repository import CourseRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.section_repository import SectionRepository


class PlayerService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.section_repo = SectionRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)

    def get_curriculum(self, course_id: uuid.UUID, current_user: User | None) -> list[Section]:
        course = self.course_repo.get_by_id(course_id)
        if not course:
            raise NotFoundError("Course not found")

        has_full_access = self._has_full_access(course_id, course.instructor_id, current_user)
        sections = self.section_repo.list_for_course(course_id)

        if not has_full_access:
            for section in sections:
                for lesson in section.lessons:
                    if not lesson.is_preview:
                        lesson.video_url = None

        return sections

    def _has_full_access(
        self, course_id: uuid.UUID, instructor_id: uuid.UUID, current_user: User | None
    ) -> bool:
        if current_user is None:
            return False
        if current_user.role == UserRole.ADMIN:
            return True
        if current_user.id == instructor_id:
            return True
        if current_user.role == UserRole.STUDENT:
            return self.enrollment_repo.get(current_user.id, course_id) is not None
        return False
