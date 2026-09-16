import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.schemas.quiz import QuestionCreate, QuestionOut, QuizCreate, QuizOut
from app.services.quiz_builder_service import QuizBuilderService

router = APIRouter(tags=["quiz-builder"])


@router.post("/lessons/{lesson_id}/quizzes", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz(
    lesson_id: uuid.UUID,
    payload: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return QuizBuilderService(db).create_quiz(lesson_id, current_user, payload)


@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    QuizBuilderService(db).delete_quiz(quiz_id, current_user)


@router.post(
    "/quizzes/{quiz_id}/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED
)
def add_question(
    quiz_id: uuid.UUID,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    return QuizBuilderService(db).add_question(quiz_id, current_user, payload)


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.INSTRUCTOR, UserRole.ADMIN)),
):
    QuizBuilderService(db).delete_question(question_id, current_user)
