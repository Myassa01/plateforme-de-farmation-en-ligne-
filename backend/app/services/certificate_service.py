import uuid
from datetime import date

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, NotFoundError
from app.models.certificate import Certificate
from app.models.certificate_settings import CertificateSettings
from app.models.user import UserRole
from app.repositories.certificate_repository import CertificateRepository
from app.repositories.certificate_settings_repository import CertificateSettingsRepository
from app.repositories.course_repository import CourseRepository
from app.repositories.user_repository import UserRepository
from app.schemas.certificate import CertificateCreate
from app.storage.local_storage import storage_service


class CertificateService:
    def __init__(self, db: Session):
        self.db = db
        self.certificates = CertificateRepository(db)
        self.settings = CertificateSettingsRepository(db)
        self.users = UserRepository(db)
        self.courses = CourseRepository(db)

    def create_certificate(self, issued_by_id: uuid.UUID, payload: CertificateCreate) -> Certificate:
        student = self.users.get_by_id(payload.student_id)
        if not student or student.role != UserRole.STUDENT:
            raise NotFoundError("Student not found")

        course = self.courses.get_by_id(payload.course_id)
        if not course:
            raise NotFoundError("Course not found")

        existing = self.certificates.get_by_student_and_course(payload.student_id, payload.course_id)
        if existing:
            raise ConflictError("A certificate already exists for this student and course")

        certificate = Certificate(
            student_id=payload.student_id,
            course_id=payload.course_id,
            issued_by_id=issued_by_id,
            issued_at=payload.issued_at or date.today(),
        )
        return self.certificates.create(certificate)

    def list_for_student(self, student_id: uuid.UUID) -> list[Certificate]:
        return self.certificates.list_for_student(student_id)

    def list_all(self) -> list[Certificate]:
        return self.certificates.list_all()

    def get_settings(self) -> CertificateSettings:
        settings = self.settings.get()
        return settings or CertificateSettings()

    def upload_background(self, file: UploadFile) -> CertificateSettings:
        background_url = storage_service.save_image(file)
        settings = self.settings.get() or CertificateSettings()
        settings.background_url = background_url
        return self.settings.save(settings)
