import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enrollment import Enrollment


class EnrollmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Enrollment | None:
        stmt = select(Enrollment).where(
            Enrollment.student_id == student_id, Enrollment.course_id == course_id
        )
        return self.db.scalars(stmt).first()

    def list_for_student(self, student_id: uuid.UUID) -> list[Enrollment]:
        stmt = (
            select(Enrollment)
            .where(Enrollment.student_id == student_id)
            .order_by(Enrollment.enrolled_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def count_for_course(self, course_id: uuid.UUID) -> int:
        stmt = select(Enrollment).where(Enrollment.course_id == course_id)
        return len(list(self.db.scalars(stmt).all()))

    def create(self, enrollment: Enrollment) -> Enrollment:
        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment

    def update(self, enrollment: Enrollment) -> Enrollment:
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment
