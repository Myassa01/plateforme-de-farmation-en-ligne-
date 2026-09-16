import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.review import (
    CourseRatingSummary,
    ReviewCreate,
    ReviewOut,
    ReviewUpdate,
)
from app.services.review_service import ReviewService

router = APIRouter(tags=["reviews"])


@router.get("/courses/{course_id}/reviews", response_model=list[ReviewOut])
def list_reviews(course_id: uuid.UUID, db: Session = Depends(get_db)):
    return ReviewService(db).list_for_course(course_id)


@router.get("/courses/{course_id}/reviews/summary", response_model=CourseRatingSummary)
def get_rating_summary(course_id: uuid.UUID, db: Session = Depends(get_db)):
    return ReviewService(db).get_rating_summary(course_id)


@router.post(
    "/courses/{course_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED
)
def create_review(
    course_id: uuid.UUID,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return ReviewService(db).create_review(course_id, student.id, payload)


@router.patch("/reviews/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: uuid.UUID,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return ReviewService(db).update_review(review_id, student.id, payload)


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    ReviewService(db).delete_review(review_id, student.id)
