import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import require_role
from app.exceptions.base import ConflictError
from app.models.user import User, UserRole
from app.schemas.user import PaginatedUsers, UserOut, UserRoleUpdate
from app.services.admin_user_service import AdminUserService

router = APIRouter(prefix="/admin/users", tags=["admin"])


@router.get("", response_model=PaginatedUsers)
def list_users(
    role: UserRole | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    items, total = AdminUserService(db).list_users(role, page, page_size)
    return PaginatedUsers(
        items=[UserOut.model_validate(user) for user in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: uuid.UUID,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(UserRole.ADMIN)),
):
    if user_id == admin.id:
        raise ConflictError("You cannot change your own role")
    return AdminUserService(db).update_role(user_id, payload.role)


@router.patch("/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(UserRole.ADMIN)),
):
    if user_id == admin.id:
        raise ConflictError("You cannot deactivate your own account")
    return AdminUserService(db).set_active(user_id, is_active=False)


@router.patch("/{user_id}/activate", response_model=UserOut)
def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return AdminUserService(db).set_active(user_id, is_active=True)
