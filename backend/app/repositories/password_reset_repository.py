from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.password_reset_token import PasswordResetToken


class PasswordResetRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_token_hash(self, token_hash: str) -> PasswordResetToken | None:
        stmt = select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        return self.db.scalars(stmt).first()

    def create(self, reset_token: PasswordResetToken) -> PasswordResetToken:
        self.db.add(reset_token)
        self.db.commit()
        self.db.refresh(reset_token)
        return reset_token

    def update(self, reset_token: PasswordResetToken) -> PasswordResetToken:
        self.db.commit()
        self.db.refresh(reset_token)
        return reset_token
