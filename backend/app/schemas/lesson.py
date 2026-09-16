import uuid

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    video_url: str | None = None
    duration_seconds: int = Field(default=0, ge=0)
    is_preview: bool = False


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    video_url: str | None = None
    duration_seconds: int | None = Field(default=None, ge=0)
    is_preview: bool | None = None
    order_index: int | None = None


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_id: uuid.UUID
    title: str
    video_url: str | None
    duration_seconds: int
    order_index: int
    is_preview: bool
    quiz_id: uuid.UUID | None = None

    @model_validator(mode="before")
    @classmethod
    def _extract_quiz_id(cls, obj):
        quiz = getattr(obj, "quiz", None)
        if quiz is not None:
            if isinstance(obj, dict):
                obj = dict(obj)
            else:
                obj = {
                    "id": obj.id,
                    "section_id": obj.section_id,
                    "title": obj.title,
                    "video_url": obj.video_url,
                    "duration_seconds": obj.duration_seconds,
                    "order_index": obj.order_index,
                    "is_preview": obj.is_preview,
                }
            obj["quiz_id"] = quiz.id
        return obj


class LessonProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lesson_id: uuid.UUID
    is_completed: bool


class LessonWithQuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    section_id: uuid.UUID
    title: str
    video_url: str | None
    duration_seconds: int
    order_index: int
    is_preview: bool
    quiz: "QuizOut | None" = None


from app.schemas.quiz import QuizOut  # noqa: E402

LessonWithQuizOut.model_rebuild()
