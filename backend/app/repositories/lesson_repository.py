import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.lesson import Lesson


class LessonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, lesson_id: uuid.UUID) -> Lesson | None:
        return self.db.get(Lesson, lesson_id)

    def list_for_section(self, section_id: uuid.UUID) -> list[Lesson]:
        stmt = select(Lesson).where(Lesson.section_id == section_id).order_by(Lesson.order_index)
        return list(self.db.scalars(stmt).all())

    def list_for_course(self, course_id: uuid.UUID) -> list[Lesson]:
        from app.models.section import Section

        stmt = (
            select(Lesson)
            .join(Section, Lesson.section_id == Section.id)
            .where(Section.course_id == course_id)
        )
        return list(self.db.scalars(stmt).all())

    def next_order_index(self, section_id: uuid.UUID) -> int:
        stmt = select(func.max(Lesson.order_index)).where(Lesson.section_id == section_id)
        current_max = self.db.scalar(stmt)
        return (current_max or -1) + 1

    def create(self, lesson: Lesson) -> Lesson:
        self.db.add(lesson)
        self.db.commit()
        self.db.refresh(lesson)
        return lesson

    def update(self, lesson: Lesson) -> Lesson:
        self.db.commit()
        self.db.refresh(lesson)
        return lesson

    def delete(self, lesson: Lesson) -> None:
        self.db.delete(lesson)
        self.db.commit()
