import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, NotFoundError
from app.models.wishlist import Wishlist
from app.repositories.course_repository import CourseRepository
from app.repositories.wishlist_repository import WishlistRepository


class WishlistService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WishlistRepository(db)
        self.course_repo = CourseRepository(db)

    def list_for_student(self, student_id: uuid.UUID) -> list[Wishlist]:
        return self.repo.list_for_student(student_id)

    def add(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Wishlist:
        if not self.course_repo.get_by_id(course_id):
            raise NotFoundError("Course not found")
        if self.repo.get(student_id, course_id):
            raise ConflictError("Course already in wishlist")

        item = Wishlist(student_id=student_id, course_id=course_id)
        return self.repo.create(item)

    def remove(self, student_id: uuid.UUID, course_id: uuid.UUID) -> None:
        item = self.repo.get(student_id, course_id)
        if not item:
            raise NotFoundError("Course not found in wishlist")
        self.repo.delete(item)
