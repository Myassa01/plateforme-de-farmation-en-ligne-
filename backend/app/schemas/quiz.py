import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.question import QuestionType


class AnswerCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    is_correct: bool = False


class QuestionCreate(BaseModel):
    text: str = Field(min_length=1)
    type: QuestionType
    answers: list[AnswerCreate] = Field(min_length=2)


class QuizCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    passing_score: int = Field(default=70, ge=0, le=100)


# --- Instructor-facing (full visibility, including correct answers) ---


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    is_correct: bool


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    type: QuestionType
    order_index: int
    answers: list[AnswerOut]


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lesson_id: uuid.UUID
    title: str
    passing_score: int
    questions: list[QuestionOut]


# --- Student-facing (no is_correct leaked before submission) ---


class AnswerForAttempt(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str


class QuestionForAttempt(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    type: QuestionType
    order_index: int
    answers: list[AnswerForAttempt]


class QuizForAttempt(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lesson_id: uuid.UUID
    title: str
    passing_score: int
    questions: list[QuestionForAttempt]


# --- Submission ---


class QuizAnswerSubmission(BaseModel):
    question_id: uuid.UUID
    selected_answer_id: uuid.UUID


class QuizSubmission(BaseModel):
    answers: list[QuizAnswerSubmission]


class AttemptAnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: uuid.UUID
    selected_answer_id: uuid.UUID
    is_correct: bool


class QuizAttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quiz_id: uuid.UUID
    score: int
    passed: bool
    attempted_at: datetime
    attempt_answers: list[AttemptAnswerOut]
