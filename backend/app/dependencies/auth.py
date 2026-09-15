import uuid
from collections.abc import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import TokenType, decode_token
from app.database.session import get_db
from app.exceptions.base import ForbiddenError, UnauthorizedError
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise UnauthorizedError("Not authenticated")

    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise UnauthorizedError("Invalid or expired token") from exc

    if payload.get("type") != TokenType.ACCESS.value:
        raise UnauthorizedError("Token is not an access token")

    user = UserRepository(db).get_by_id(uuid.UUID(payload["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    return user


def require_role(*allowed_roles: UserRole) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenError("You do not have permission to perform this action")
        return current_user

    return dependency
