import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lesson_progress import LessonProgress


class LessonProgressRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, enrollment_id: uuid.UUID, lesson_id: uuid.UUID) -> LessonProgress | None:
        stmt = select(LessonProgress).where(
            LessonProgress.enrollment_id == enrollment_id, LessonProgress.lesson_id == lesson_id
        )
        return self.db.scalars(stmt).first()

    def list_for_enrollment(self, enrollment_id: uuid.UUID) -> list[LessonProgress]:
        stmt = select(LessonProgress).where(LessonProgress.enrollment_id == enrollment_id)
        return list(self.db.scalars(stmt).all())

    def create(self, progress: LessonProgress) -> LessonProgress:
        self.db.add(progress)
        self.db.commit()
        self.db.refresh(progress)
        return progress

    def update(self, progress: LessonProgress) -> LessonProgress:
        self.db.commit()
        self.db.refresh(progress)
        return progress
