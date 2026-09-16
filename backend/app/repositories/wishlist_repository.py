import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.wishlist import Wishlist


class WishlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Wishlist | None:
        stmt = select(Wishlist).where(
            Wishlist.student_id == student_id, Wishlist.course_id == course_id
        )
        return self.db.scalars(stmt).first()

    def list_for_student(self, student_id: uuid.UUID) -> list[Wishlist]:
        stmt = (
            select(Wishlist)
            .where(Wishlist.student_id == student_id)
            .order_by(Wishlist.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def create(self, wishlist_item: Wishlist) -> Wishlist:
        self.db.add(wishlist_item)
        self.db.commit()
        self.db.refresh(wishlist_item)
        return wishlist_item

    def delete(self, wishlist_item: Wishlist) -> None:
        self.db.delete(wishlist_item)
        self.db.commit()
