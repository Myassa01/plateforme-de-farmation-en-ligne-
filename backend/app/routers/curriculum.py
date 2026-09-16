import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.lesson import LessonCreate, LessonOut, LessonUpdate
from app.schemas.section import SectionCreate, SectionOut, SectionUpdate
from app.services.curriculum_service import CurriculumService

router = APIRouter(tags=["curriculum"])


@router.post(
    "/courses/{course_id}/sections", response_model=SectionOut, status_code=status.HTTP_201_CREATED
)
def create_section(
    course_id: uuid.UUID,
    payload: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CurriculumService(db).create_section(course_id, current_user, payload)


@router.patch("/sections/{section_id}", response_model=SectionOut)
def update_section(
    section_id: uuid.UUID,
    payload: SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CurriculumService(db).update_section(section_id, current_user, payload)


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    CurriculumService(db).delete_section(section_id, current_user)


@router.post(
    "/sections/{section_id}/lessons", response_model=LessonOut, status_code=status.HTTP_201_CREATED
)
def create_lesson(
    section_id: uuid.UUID,
    payload: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CurriculumService(db).create_lesson(section_id, current_user, payload)


@router.patch("/lessons/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: uuid.UUID,
    payload: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CurriculumService(db).update_lesson(lesson_id, current_user, payload)


@router.delete("/lessons/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    CurriculumService(db).delete_lesson(lesson_id, current_user)
