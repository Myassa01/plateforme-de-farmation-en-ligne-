import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.course import CourseListItem


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course: CourseListItem
    created_at: datetime
