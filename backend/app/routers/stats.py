from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.stats import AdminStats, InstructorStats, StudentStats
from app.services.stats_service import StatsService

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/student", response_model=StudentStats)
def get_student_stats(
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return StatsService(db).get_student_stats(student.id)


@router.get("/instructor", response_model=InstructorStats)
def get_instructor_stats(
    db: Session = Depends(get_db),
    instructor: User = Depends(require_role(UserRole.INSTRUCTOR)),
):
    return StatsService(db).get_instructor_stats(instructor.id)


@router.get("/admin", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return StatsService(db).get_admin_stats()
