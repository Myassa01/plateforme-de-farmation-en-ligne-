import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import NotFoundError
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository


class AdminUserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def list_users(self, role: UserRole | None, page: int, page_size: int) -> tuple[list[User], int]:
        return self.repo.list_all(role, page, page_size)

    def update_role(self, user_id: uuid.UUID, new_role: UserRole) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        user.role = new_role
        return self.repo.update(user)

    def set_active(self, user_id: uuid.UUID, is_active: bool) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        user.is_active = is_active
        return self.repo.update(user)
