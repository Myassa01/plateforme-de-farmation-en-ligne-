import uuid
from dataclasses import dataclass, field
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.course import Course, CourseLevel, CourseStatus


@dataclass
class CourseFilters:
    search: str | None = None
    category_id: uuid.UUID | None = None
    level: CourseLevel | None = None
    language: str | None = None
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    status: CourseStatus | None = None
    instructor_id: uuid.UUID | None = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = 1
    page_size: int = 12


SORTABLE_FIELDS: dict[str, object] = {
    "created_at": Course.created_at,
    "price": Course.price,
    "title": Course.title,
}


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, course_id: uuid.UUID) -> Course | None:
        stmt = select(Course).where(Course.id == course_id)
        return self.db.scalars(stmt).first()

    def get_by_slug(self, slug: str) -> Course | None:
        stmt = select(Course).where(Course.slug == slug)
        return self.db.scalars(stmt).first()

    def list_with_filters(self, filters: CourseFilters) -> tuple[list[Course], int]:
        stmt = select(Course)

        if filters.status is not None:
            stmt = stmt.where(Course.status == filters.status)
        if filters.instructor_id is not None:
            stmt = stmt.where(Course.instructor_id == filters.instructor_id)
        if filters.category_id is not None:
            stmt = stmt.where(Course.category_id == filters.category_id)
        if filters.level is not None:
            stmt = stmt.where(Course.level == filters.level)
        if filters.language is not None:
            stmt = stmt.where(Course.language == filters.language)
        if filters.min_price is not None:
            stmt = stmt.where(Course.price >= filters.min_price)
        if filters.max_price is not None:
            stmt = stmt.where(Course.price <= filters.max_price)
        if filters.search:
            like_pattern = f"%{filters.search}%"
            stmt = stmt.where(
                or_(
                    Course.title.ilike(like_pattern),
                    Course.description.ilike(like_pattern),
                    Course.category.has(Category.name.ilike(like_pattern)),
                )
            )

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.scalar(count_stmt) or 0

        sort_column = SORTABLE_FIELDS.get(filters.sort_by, Course.created_at)
        stmt = stmt.order_by(sort_column.desc() if filters.sort_order == "desc" else sort_column.asc())

        offset = (filters.page - 1) * filters.page_size
        stmt = stmt.offset(offset).limit(filters.page_size)

        items = list(self.db.scalars(stmt).all())
        return items, total

    def create(self, course: Course) -> Course:
        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)
        return course

    def update(self, course: Course) -> Course:
        self.db.commit()
        self.db.refresh(course)
        return course

    def delete(self, course: Course) -> None:
        self.db.delete(course)
        self.db.commit()
