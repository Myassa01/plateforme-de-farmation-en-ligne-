import uuid

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.security import TokenType
from app.exceptions.base import ConflictError, UnauthorizedError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenPair
from app.schemas.user import UserLogin, UserRegister


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, payload: UserRegister) -> User:
        if self.user_repo.get_by_email(payload.email):
            raise ConflictError("A user with this email already exists")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        return self.user_repo.create(user)

    def authenticate(self, payload: UserLogin) -> User:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated")
        return user

    def issue_tokens(self, user: User) -> TokenPair:
        subject = str(user.id)
        return TokenPair(
            access_token=create_access_token(subject),
            refresh_token=create_refresh_token(subject),
        )

    def refresh_access_token(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise UnauthorizedError("Invalid or expired refresh token") from exc

        if payload.get("type") != TokenType.REFRESH.value:
            raise UnauthorizedError("Token is not a refresh token")

        user_id = uuid.UUID(payload["sub"])
        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedError("User not found or inactive")

        return self.issue_tokens(user)
