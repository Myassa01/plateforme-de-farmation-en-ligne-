import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, NotFoundError
from app.models.course import CourseStatus
from app.models.payment import Payment, PaymentStatus
from app.repositories.course_repository import CourseRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.payment_repository import PaymentRepository
from app.services.enrollment_service import EnrollmentService


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.course_repo = CourseRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)
        self.enrollment_service = EnrollmentService(db)

    def pay_and_enroll(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Payment:
        course = self.course_repo.get_by_id(course_id)
        if not course or course.status != CourseStatus.PUBLISHED:
            raise NotFoundError("Course not found")

        if self.enrollment_repo.get(student_id, course_id):
            raise ConflictError("Already enrolled in this course")

        # Simulated payment: always succeeds immediately, no real card/bank
        # data is ever collected or stored.
        payment = Payment(
            student_id=student_id,
            course_id=course_id,
            amount=course.price,
            status=PaymentStatus.SUCCEEDED,
            method="simulated",
        )
        payment = self.payment_repo.create(payment)

        self.enrollment_service.enroll(student_id, course_id)

        return payment
