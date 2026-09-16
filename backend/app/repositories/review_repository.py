import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.review import Review


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, review_id: uuid.UUID) -> Review | None:
        return self.db.get(Review, review_id)

    def get_by_student_and_course(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Review | None:
        stmt = select(Review).where(Review.student_id == student_id, Review.course_id == course_id)
        return self.db.scalars(stmt).first()

    def list_for_course(self, course_id: uuid.UUID) -> list[Review]:
        stmt = select(Review).where(Review.course_id == course_id).order_by(Review.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_rating_summary(self, course_id: uuid.UUID) -> tuple[float, int]:
        stmt = select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.course_id == course_id
        )
        avg_rating, total = self.db.execute(stmt).one()
        return (round(float(avg_rating), 2) if avg_rating is not None else 0.0, total)

    def create(self, review: Review) -> Review:
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def update(self, review: Review) -> Review:
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review: Review) -> None:
        self.db.delete(review)
        self.db.commit()
