import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.enrollment import EnrollmentOut
from app.schemas.payment import PaymentOut, SimulatedPaymentRequest
from app.services.enrollment_service import EnrollmentService
from app.services.payment_service import PaymentService

router = APIRouter(tags=["enrollments"])


@router.post(
    "/courses/{course_id}/pay", response_model=PaymentOut, status_code=status.HTTP_201_CREATED
)
def pay_for_course(
    course_id: uuid.UUID,
    _payload: SimulatedPaymentRequest = SimulatedPaymentRequest(),
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return PaymentService(db).pay_and_enroll(student.id, course_id)


@router.get("/my-courses", response_model=list[EnrollmentOut])
def list_my_enrollments(
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return EnrollmentService(db).list_for_student(student.id)
