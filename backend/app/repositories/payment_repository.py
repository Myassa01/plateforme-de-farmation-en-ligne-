import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.payment import Payment, PaymentStatus


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_succeeded_payment(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Payment | None:
        stmt = select(Payment).where(
            Payment.student_id == student_id,
            Payment.course_id == course_id,
            Payment.status == PaymentStatus.SUCCEEDED,
        )
        return self.db.scalars(stmt).first()

    def create(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment
