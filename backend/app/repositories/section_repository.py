import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.section import Section


class SectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, section_id: uuid.UUID) -> Section | None:
        return self.db.get(Section, section_id)

    def list_for_course(self, course_id: uuid.UUID) -> list[Section]:
        stmt = (
            select(Section).where(Section.course_id == course_id).order_by(Section.order_index)
        )
        return list(self.db.scalars(stmt).all())

    def next_order_index(self, course_id: uuid.UUID) -> int:
        stmt = select(func.max(Section.order_index)).where(Section.course_id == course_id)
        current_max = self.db.scalar(stmt)
        return (current_max or -1) + 1

    def create(self, section: Section) -> Section:
        self.db.add(section)
        self.db.commit()
        self.db.refresh(section)
        return section

    def update(self, section: Section) -> Section:
        self.db.commit()
        self.db.refresh(section)
        return section

    def delete(self, section: Section) -> None:
        self.db.delete(section)
        self.db.commit()
