import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz


class QuizRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, quiz_id: uuid.UUID) -> Quiz | None:
        return self.db.get(Quiz, quiz_id)

    def get_by_lesson(self, lesson_id: uuid.UUID) -> Quiz | None:
        stmt = select(Quiz).where(Quiz.lesson_id == lesson_id)
        return self.db.scalars(stmt).first()

    def create(self, quiz: Quiz) -> Quiz:
        self.db.add(quiz)
        self.db.commit()
        self.db.refresh(quiz)
        return quiz

    def delete(self, quiz: Quiz) -> None:
        self.db.delete(quiz)
        self.db.commit()

    def next_question_order_index(self, quiz_id: uuid.UUID) -> int:
        from sqlalchemy import func

        stmt = select(func.max(Question.order_index)).where(Question.quiz_id == quiz_id)
        current_max = self.db.scalar(stmt)
        return (current_max or -1) + 1

    def create_question(self, question: Question) -> Question:
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def get_answer(self, answer_id: uuid.UUID) -> Answer | None:
        return self.db.get(Answer, answer_id)

    def get_question(self, question_id: uuid.UUID) -> Question | None:
        return self.db.get(Question, question_id)
