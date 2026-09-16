import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.enrollment import EnrollmentOut
from app.services.enrollment_service import EnrollmentService

router = APIRouter(tags=["enrollments"])


@router.post(
    "/courses/{course_id}/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED
)
def enroll_in_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return EnrollmentService(db).enroll(student.id, course_id)


@router.get("/my-courses", response_model=list[EnrollmentOut])
def list_my_enrollments(
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return EnrollmentService(db).list_for_student(student.id)
