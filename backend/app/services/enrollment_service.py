import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, ForbiddenError, NotFoundError
from app.models.course import CourseStatus
from app.models.enrollment import Enrollment
from app.models.notification import NotificationType
from app.models.user import User, UserRole
from app.repositories.course_repository import CourseRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.services.notification_service import NotificationService


class EnrollmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EnrollmentRepository(db)
        self.course_repo = CourseRepository(db)
        self.notification_service = NotificationService(db)

    def list_for_student(self, student_id: uuid.UUID) -> list[Enrollment]:
        return self.repo.list_for_student(student_id)

    def list_for_course(self, course_id: uuid.UUID, current_user: User) -> list[Enrollment]:
        course = self.course_repo.get_by_id(course_id)
        if not course:
            raise NotFoundError("Course not found")

        is_owner = current_user.id == course.instructor_id
        is_admin = current_user.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise ForbiddenError("You do not have permission to view this course's students")

        return self.repo.list_for_course(course_id)

    def enroll(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Enrollment:
        course = self.course_repo.get_by_id(course_id)
        if not course or course.status != CourseStatus.PUBLISHED:
            raise NotFoundError("Course not found")
        if self.repo.get(student_id, course_id):
            raise ConflictError("Already enrolled in this course")

        enrollment = Enrollment(student_id=student_id, course_id=course_id)
        created = self.repo.create(enrollment)

        self.notification_service.notify(
            user_id=course.instructor_id,
            notif_type=NotificationType.NEW_ENROLLMENT,
            title="Nouvelle inscription",
            message=f"Un étudiant s'est inscrit à votre formation \"{course.title}\".",
            related_entity_id=course.id,
        )

        return created
