import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)


class UserRegister(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    bio: str | None = None
    avatar_url: str | None = None


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: UserRole
    avatar_url: str | None
    bio: str | None
    is_active: bool
    created_at: datetime


class PaginatedUsers(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    page_size: int
