import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user_optional, require_role
from app.models.course import CourseLevel
from app.models.user import User, UserRole
from app.repositories.course_repository import CourseFilters
from app.schemas.course import (
    CourseCreate,
    CourseListItem,
    CourseOut,
    CourseReject,
    CourseUpdate,
    PaginatedCourses,
)
from app.services.course_service import CourseService

router = APIRouter(tags=["courses"])


def _build_filters(
    search: str | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    level: CourseLevel | None = Query(default=None),
    language: str | None = Query(default=None),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    sort_by: str = Query(default="created_at", pattern="^(created_at|price|title)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
) -> CourseFilters:
    return CourseFilters(
        search=search,
        category_id=category_id,
        level=level,
        language=language,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )


@router.get("/courses", response_model=PaginatedCourses)
def list_courses(
    filters: CourseFilters = Depends(_build_filters),
    db: Session = Depends(get_db),
):
    items, total = CourseService(db).list_public_courses(filters)
    return PaginatedCourses(
        items=[CourseListItem.model_validate(course) for course in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
    )


@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    return CourseService(db).get_visible_course(course_id, current_user)


@router.post("/courses", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CourseService(db).create_course(current_user, payload)


@router.patch("/courses/{course_id}", response_model=CourseOut)
def update_course(
    course_id: uuid.UUID,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CourseService(db).update_course(course_id, current_user, payload)


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    CourseService(db).delete_course(course_id, current_user)


@router.post("/courses/{course_id}/thumbnail", response_model=CourseOut)
def upload_course_thumbnail(
    course_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CourseService(db).upload_thumbnail(course_id, current_user, file)


@router.post("/courses/{course_id}/submit", response_model=CourseOut)
def submit_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return CourseService(db).submit_for_review(course_id, current_user)


@router.post("/courses/{course_id}/approve", response_model=CourseOut)
def approve_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return CourseService(db).approve_course(course_id)


@router.post("/courses/{course_id}/reject", response_model=CourseOut)
def reject_course(
    course_id: uuid.UUID,
    payload: CourseReject,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return CourseService(db).reject_course(course_id, payload)


@router.get("/instructor/courses", response_model=PaginatedCourses)
def list_instructor_courses(
    filters: CourseFilters = Depends(_build_filters),
    db: Session = Depends(get_db),
    instructor: User = Depends(require_role(UserRole.INSTRUCTOR)),
):
    items, total = CourseService(db).list_instructor_courses(instructor.id, filters)
    return PaginatedCourses(
        items=[CourseListItem.model_validate(course) for course in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
    )


@router.get("/admin/courses", response_model=PaginatedCourses)
def list_all_courses(
    filters: CourseFilters = Depends(_build_filters),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    items, total = CourseService(db).list_all_courses(filters)
    return PaginatedCourses(
        items=[CourseListItem.model_validate(course) for course in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
    )


@router.get("/admin/courses/pending", response_model=PaginatedCourses)
def list_pending_courses(
    filters: CourseFilters = Depends(_build_filters),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    items, total = CourseService(db).list_pending_courses(filters)
    return PaginatedCourses(
        items=[CourseListItem.model_validate(course) for course in items],
        total=total,
        page=filters.page,
        page_size=filters.page_size,
    )
