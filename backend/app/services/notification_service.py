import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ForbiddenError, NotFoundError
from app.models.notification import Notification, NotificationType
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def list_for_user(self, user_id: uuid.UUID) -> list[Notification]:
        return self.repo.list_for_user(user_id)

    def mark_as_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification:
        notification = self.repo.get_by_id(notification_id)
        if not notification:
            raise NotFoundError("Notification not found")
        if notification.user_id != user_id:
            raise ForbiddenError("You do not have permission to access this notification")

        notification.is_read = True
        return self.repo.update(notification)

    def notify(
        self,
        user_id: uuid.UUID,
        notif_type: NotificationType,
        title: str,
        message: str,
        related_entity_id: uuid.UUID | None = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=notif_type,
            title=title,
            message=message,
            related_entity_id=related_entity_id,
        )
        return self.repo.create(notification)
