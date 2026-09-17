import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.payment import PaymentStatus


class SimulatedPaymentRequest(BaseModel):
    """Simulated payment - never carries real card/bank data."""

    card_last4: str | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    amount: Decimal
    status: PaymentStatus
    method: str
    created_at: datetime
