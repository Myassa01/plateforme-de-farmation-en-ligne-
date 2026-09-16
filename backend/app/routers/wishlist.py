import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.wishlist import WishlistItemOut
from app.services.wishlist_service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[WishlistItemOut])
def list_wishlist(
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return WishlistService(db).list_for_student(student.id)


@router.post("/{course_id}", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return WishlistService(db).add(student.id, course_id)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    WishlistService(db).remove(student.id, course_id)
