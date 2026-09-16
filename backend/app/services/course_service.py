import uuid

from sqlalchemy.orm import Session

from app.exceptions.base import ConflictError, ForbiddenError, NotFoundError
from app.models.course import Course, CourseStatus
from app.models.user import User, UserRole
from app.repositories.category_repository import CategoryRepository
from app.repositories.course_repository import CourseFilters, CourseRepository
from app.schemas.course import CourseCreate, CourseReject, CourseUpdate
from app.utils.slugify import slugify


class CourseService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CourseRepository(db)
        self.category_repo = CategoryRepository(db)

    def list_public_courses(self, filters: CourseFilters) -> tuple[list[Course], int]:
        filters.status = CourseStatus.PUBLISHED
        return self.repo.list_with_filters(filters)

    def list_instructor_courses(self, instructor_id: uuid.UUID, filters: CourseFilters) -> tuple[list[Course], int]:
        filters.instructor_id = instructor_id
        return self.repo.list_with_filters(filters)

    def list_pending_courses(self, filters: CourseFilters) -> tuple[list[Course], int]:
        filters.status = CourseStatus.PENDING
        return self.repo.list_with_filters(filters)

    def list_all_courses(self, filters: CourseFilters) -> tuple[list[Course], int]:
        return self.repo.list_with_filters(filters)

    def get_course(self, course_id: uuid.UUID) -> Course:
        course = self.repo.get_by_id(course_id)
        if not course:
            raise NotFoundError("Course not found")
        return course

    def get_visible_course(self, course_id: uuid.UUID, current_user: User | None) -> Course:
        course = self.get_course(course_id)
        if course.status == CourseStatus.PUBLISHED:
            return course

        is_owner = current_user is not None and current_user.id == course.instructor_id
        is_admin = current_user is not None and current_user.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise NotFoundError("Course not found")

        return course

    def create_course(self, instructor: User, payload: CourseCreate) -> Course:
        if not self.category_repo.get_by_id(payload.category_id):
            raise NotFoundError("Category not found")

        slug = self._generate_unique_slug(payload.title)
        course = Course(
            instructor_id=instructor.id,
            category_id=payload.category_id,
            title=payload.title,
            slug=slug,
            description=payload.description,
            thumbnail_url=payload.thumbnail_url,
            level=payload.level,
            language=payload.language,
            price=payload.price,
            status=CourseStatus.DRAFT,
        )
        return self.repo.create(course)

    def update_course(self, course_id: uuid.UUID, current_user: User, payload: CourseUpdate) -> Course:
        course = self.get_course(course_id)
        self._ensure_can_manage(course, current_user)

        updates = payload.model_dump(exclude_unset=True)

        if "category_id" in updates and not self.category_repo.get_by_id(updates["category_id"]):
            raise NotFoundError("Category not found")

        if "title" in updates and updates["title"] != course.title:
            course.slug = self._generate_unique_slug(updates["title"], exclude_course_id=course.id)

        for field, value in updates.items():
            setattr(course, field, value)

        return self.repo.update(course)

    def delete_course(self, course_id: uuid.UUID, current_user: User) -> None:
        course = self.get_course(course_id)
        self._ensure_can_manage(course, current_user)
        self.repo.delete(course)

    def submit_for_review(self, course_id: uuid.UUID, current_user: User) -> Course:
        course = self.get_course(course_id)
        self._ensure_can_manage(course, current_user)

        if course.status not in (CourseStatus.DRAFT, CourseStatus.REJECTED):
            raise ConflictError("Only draft or rejected courses can be submitted for review")

        course.status = CourseStatus.PENDING
        course.rejection_reason = None
        return self.repo.update(course)

    def approve_course(self, course_id: uuid.UUID) -> Course:
        course = self.get_course(course_id)
        if course.status != CourseStatus.PENDING:
            raise ConflictError("Only pending courses can be approved")

        course.status = CourseStatus.PUBLISHED
        course.rejection_reason = None
        return self.repo.update(course)

    def reject_course(self, course_id: uuid.UUID, payload: CourseReject) -> Course:
        course = self.get_course(course_id)
        if course.status != CourseStatus.PENDING:
            raise ConflictError("Only pending courses can be rejected")

        course.status = CourseStatus.REJECTED
        course.rejection_reason = payload.reason
        return self.repo.update(course)

    def _ensure_can_manage(self, course: Course, current_user: User) -> None:
        is_owner = current_user.id == course.instructor_id
        is_admin = current_user.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise ForbiddenError("You do not have permission to manage this course")

    def _generate_unique_slug(self, title: str, exclude_course_id: uuid.UUID | None = None) -> str:
        base_slug = slugify(title)
        slug = base_slug
        suffix = 1
        while True:
            existing = self.repo.get_by_slug(slug)
            if not existing or existing.id == exclude_course_id:
                return slug
            suffix += 1
            slug = f"{base_slug}-{suffix}"
