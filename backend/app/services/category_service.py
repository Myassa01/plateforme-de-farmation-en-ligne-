import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, NotFoundError
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.slugify import slugify


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    def list_categories(self) -> list[Category]:
        return self.repo.list_all()

    def get_category(self, category_id: uuid.UUID) -> Category:
        category = self.repo.get_by_id(category_id)
        if not category:
            raise NotFoundError("Category not found")
        return category

    def create_category(self, payload: CategoryCreate) -> Category:
        if self.repo.get_by_name(payload.name):
            raise ConflictError("A category with this name already exists")

        slug = slugify(payload.name)
        if self.repo.get_by_slug(slug):
            raise ConflictError("A category with a similar name already exists")

        category = Category(
            name=payload.name,
            slug=slug,
            description=payload.description,
            icon=payload.icon,
        )
        return self.repo.create(category)

    def update_category(self, category_id: uuid.UUID, payload: CategoryUpdate) -> Category:
        category = self.get_category(category_id)
        updates = payload.model_dump(exclude_unset=True)

        if "name" in updates and updates["name"] != category.name:
            if self.repo.get_by_name(updates["name"]):
                raise ConflictError("A category with this name already exists")
            category.slug = slugify(updates["name"])

        for field, value in updates.items():
            setattr(category, field, value)

        return self.repo.update(category)

    def delete_category(self, category_id: uuid.UUID) -> None:
        category = self.get_category(category_id)
        self.repo.delete(category)
