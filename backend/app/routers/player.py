import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user_optional, require_role
from app.models.user import User, UserRole
from app.schemas.lesson import LessonProgressOut
from app.schemas.progress import CourseProgressOut, LessonWatchProgressUpdate
from app.schemas.section import SectionWithLessonsOut
from app.services.player_service import PlayerService
from app.services.progress_service import ProgressService

router = APIRouter(tags=["player"])


@router.get("/courses/{course_id}/curriculum", response_model=list[SectionWithLessonsOut])
def get_curriculum(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    return PlayerService(db).get_curriculum(course_id, current_user)


@router.post("/lessons/{lesson_id}/complete", response_model=LessonProgressOut)
def complete_lesson(
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return ProgressService(db).complete_lesson(lesson_id, student.id)


@router.patch("/lessons/{lesson_id}/progress", response_model=LessonProgressOut)
def save_watch_progress(
    lesson_id: uuid.UUID,
    payload: LessonWatchProgressUpdate,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return ProgressService(db).save_watch_progress(lesson_id, student.id, payload.watched_seconds)


@router.get("/courses/{course_id}/progress", response_model=CourseProgressOut)
def get_course_progress(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return ProgressService(db).get_course_progress(course_id, student.id)
