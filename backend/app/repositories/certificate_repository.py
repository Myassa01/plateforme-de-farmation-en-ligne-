import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.certificate import Certificate


class CertificateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, certificate_id: uuid.UUID) -> Certificate | None:
        return self.db.get(Certificate, certificate_id)

    def get_by_student_and_course(
        self, student_id: uuid.UUID, course_id: uuid.UUID
    ) -> Certificate | None:
        stmt = select(Certificate).where(
            Certificate.student_id == student_id, Certificate.course_id == course_id
        )
        return self.db.scalars(stmt).first()

    def list_for_student(self, student_id: uuid.UUID) -> list[Certificate]:
        stmt = (
            select(Certificate)
            .where(Certificate.student_id == student_id)
            .order_by(Certificate.issued_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def list_all(self) -> list[Certificate]:
        stmt = select(Certificate).order_by(Certificate.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def create(self, certificate: Certificate) -> Certificate:
        self.db.add(certificate)
        self.db.commit()
        self.db.refresh(certificate)
        return certificate
