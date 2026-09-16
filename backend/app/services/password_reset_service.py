import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.exceptions.base import UnauthorizedError
from app.models.password_reset_token import PasswordResetToken
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

RESET_TOKEN_TTL = timedelta(hours=1)


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


class PasswordResetService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reset_repo = PasswordResetRepository(db)
        self.email_service = EmailService()

    def request_reset(self, email: str) -> None:
        user = self.user_repo.get_by_email(email)
        if not user:
            # Do not reveal whether the email exists.
            return

        raw_token = secrets.token_urlsafe(32)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + RESET_TOKEN_TTL,
        )
        self.reset_repo.create(reset_token)

        reset_link = f"{settings.frontend_base_url}/reset-password?token={raw_token}"
        try:
            self.email_service.send_password_reset_email(user.email, reset_link)
        except Exception:
            logger.exception("Failed to send password reset email to %s", user.email)
            logger.warning("Password reset link for %s: %s", user.email, reset_link)

    def reset_password(self, raw_token: str, new_password: str) -> None:
        token_hash = _hash_token(raw_token)
        reset_token = self.reset_repo.get_by_token_hash(token_hash)

        if not reset_token or reset_token.used:
            raise UnauthorizedError("Invalid or expired reset token")

        expires_at = reset_token.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("Invalid or expired reset token")

        user = self.user_repo.get_by_id(reset_token.user_id)
        if not user:
            raise UnauthorizedError("Invalid or expired reset token")

        user.hashed_password = hash_password(new_password)
        self.user_repo.update(user)

        reset_token.used = True
        self.reset_repo.update(reset_token)
