import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, ForbiddenError, NotFoundError
from app.models.review import Review
from app.repositories.course_repository import CourseRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import CourseRatingSummary, ReviewCreate, ReviewUpdate


class ReviewService:
    def __init__(self, db: Session):
        self.db = db
        self.review_repo = ReviewRepository(db)
        self.course_repo = CourseRepository(db)
        self.enrollment_repo = EnrollmentRepository(db)

    def list_for_course(self, course_id: uuid.UUID) -> list[Review]:
        return self.review_repo.list_for_course(course_id)

    def get_rating_summary(self, course_id: uuid.UUID) -> CourseRatingSummary:
        average, total = self.review_repo.get_rating_summary(course_id)
        return CourseRatingSummary(average_rating=average, total_reviews=total)

    def create_review(self, course_id: uuid.UUID, student_id: uuid.UUID, payload: ReviewCreate) -> Review:
        if not self.course_repo.get_by_id(course_id):
            raise NotFoundError("Course not found")

        if not self.enrollment_repo.get(student_id, course_id):
            raise ForbiddenError("You must be enrolled in this course to leave a review")

        if self.review_repo.get_by_student_and_course(student_id, course_id):
            raise ConflictError("You have already reviewed this course")

        review = Review(
            student_id=student_id,
            course_id=course_id,
            rating=payload.rating,
            comment=payload.comment,
        )
        return self.review_repo.create(review)

    def update_review(self, review_id: uuid.UUID, student_id: uuid.UUID, payload: ReviewUpdate) -> Review:
        review = self._get_owned_review(review_id, student_id)

        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(review, field, value)

        return self.review_repo.update(review)

    def delete_review(self, review_id: uuid.UUID, student_id: uuid.UUID) -> None:
        review = self._get_owned_review(review_id, student_id)
        self.review_repo.delete(review)

    def _get_owned_review(self, review_id: uuid.UUID, student_id: uuid.UUID) -> Review:
        review = self.review_repo.get_by_id(review_id)
        if not review:
            raise NotFoundError("Review not found")
        if review.student_id != student_id:
            raise ForbiddenError("You do not have permission to modify this review")
        return review
