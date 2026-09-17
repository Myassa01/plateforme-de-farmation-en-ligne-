import uuid

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.exceptions.base import ForbiddenError, NotFoundError
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.section import Section
from app.models.user import User, UserRole
from app.repositories.course_repository import CourseRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.section_repository import SectionRepository
from app.schemas.lesson import LessonCreate, LessonUpdate
from app.schemas.section import SectionCreate, SectionUpdate
from app.storage.local_storage import storage_service


class CurriculumService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.section_repo = SectionRepository(db)
        self.lesson_repo = LessonRepository(db)

    def list_sections(self, course_id: uuid.UUID) -> list[Section]:
        return self.section_repo.list_for_course(course_id)

    def list_sections_for_editor(self, course_id: uuid.UUID, current_user: User) -> list[Section]:
        self._get_owned_course(course_id, current_user)
        return self.section_repo.list_for_course(course_id)

    def create_section(self, course_id: uuid.UUID, current_user: User, payload: SectionCreate) -> Section:
        course = self._get_owned_course(course_id, current_user)
        section = Section(
            course_id=course.id,
            title=payload.title,
            order_index=self.section_repo.next_order_index(course.id),
        )
        return self.section_repo.create(section)

    def update_section(self, section_id: uuid.UUID, current_user: User, payload: SectionUpdate) -> Section:
        section = self._get_section(section_id)
        self._get_owned_course(section.course_id, current_user)

        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(section, field, value)
        return self.section_repo.update(section)

    def delete_section(self, section_id: uuid.UUID, current_user: User) -> None:
        section = self._get_section(section_id)
        self._get_owned_course(section.course_id, current_user)
        self.section_repo.delete(section)

    def create_lesson(self, section_id: uuid.UUID, current_user: User, payload: LessonCreate) -> Lesson:
        section = self._get_section(section_id)
        self._get_owned_course(section.course_id, current_user)

        lesson = Lesson(
            section_id=section.id,
            title=payload.title,
            video_url=payload.video_url,
            duration_seconds=payload.duration_seconds,
            is_preview=payload.is_preview,
            order_index=self.lesson_repo.next_order_index(section.id),
        )
        return self.lesson_repo.create(lesson)

    def update_lesson(self, lesson_id: uuid.UUID, current_user: User, payload: LessonUpdate) -> Lesson:
        lesson = self._get_lesson(lesson_id)
        section = self._get_section(lesson.section_id)
        self._get_owned_course(section.course_id, current_user)

        updates = payload.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(lesson, field, value)
        return self.lesson_repo.update(lesson)

    def delete_lesson(self, lesson_id: uuid.UUID, current_user: User) -> None:
        lesson = self._get_lesson(lesson_id)
        section = self._get_section(lesson.section_id)
        self._get_owned_course(section.course_id, current_user)
        self.lesson_repo.delete(lesson)

    def upload_lesson_video(self, lesson_id: uuid.UUID, current_user: User, file: UploadFile) -> Lesson:
        lesson = self._get_lesson(lesson_id)
        section = self._get_section(lesson.section_id)
        self._get_owned_course(section.course_id, current_user)

        lesson.video_url = storage_service.save_video(file)
        return self.lesson_repo.update(lesson)

    def _get_section(self, section_id: uuid.UUID) -> Section:
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise NotFoundError("Section not found")
        return section

    def _get_lesson(self, lesson_id: uuid.UUID) -> Lesson:
        lesson = self.lesson_repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")
        return lesson

    def _get_owned_course(self, course_id: uuid.UUID, current_user: User) -> Course:
        course = self.course_repo.get_by_id(course_id)
        if not course:
            raise NotFoundError("Course not found")

        is_owner = current_user.id == course.instructor_id
        is_admin = current_user.role == UserRole.ADMIN
        if not (is_owner or is_admin):
            raise ForbiddenError("You do not have permission to manage this course's curriculum")

        return course
