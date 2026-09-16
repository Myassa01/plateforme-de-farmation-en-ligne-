import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.quiz import QuizAttemptOut, QuizForAttempt, QuizSubmission
from app.services.quiz_attempt_service import QuizAttemptService

router = APIRouter(tags=["quiz-attempts"])


@router.get("/quizzes/{quiz_id}", response_model=QuizForAttempt)
def get_quiz(
    quiz_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return QuizAttemptService(db).get_quiz_for_attempt(quiz_id, student.id)


@router.post(
    "/quizzes/{quiz_id}/submit", response_model=QuizAttemptOut, status_code=status.HTTP_201_CREATED
)
def submit_quiz(
    quiz_id: uuid.UUID,
    payload: QuizSubmission,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return QuizAttemptService(db).submit_attempt(quiz_id, student.id, payload)


@router.get("/quizzes/{quiz_id}/attempts/{attempt_id}", response_model=QuizAttemptOut)
def get_attempt(
    quiz_id: uuid.UUID,
    attempt_id: uuid.UUID,
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return QuizAttemptService(db).get_attempt(attempt_id, student.id)
