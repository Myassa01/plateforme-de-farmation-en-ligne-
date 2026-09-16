import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.exceptions.base import ForbiddenError, NotFoundError
from app.models.lesson_progress import LessonProgress
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.lesson_progress_repository import LessonProgressRepository
from app.repositories.lesson_repository import LessonRepository
from app.schemas.progress import CourseProgressOut


class ProgressService:
    def __init__(self, db: Session):
        self.db = db
        self.enrollment_repo = EnrollmentRepository(db)
        self.lesson_repo = LessonRepository(db)
        self.progress_repo = LessonProgressRepository(db)

    def complete_lesson(self, lesson_id: uuid.UUID, student_id: uuid.UUID) -> LessonProgress:
        lesson = self.lesson_repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson not found")

        course_id = lesson.section.course_id
        enrollment = self.enrollment_repo.get(student_id, course_id)
        if not enrollment:
            raise ForbiddenError("You must be enrolled in this course to track progress")

        progress = self.progress_repo.get(enrollment.id, lesson_id)
        if not progress:
            progress = LessonProgress(enrollment_id=enrollment.id, lesson_id=lesson_id)
            progress.is_completed = True
            progress.completed_at = datetime.now(timezone.utc)
            progress = self.progress_repo.create(progress)
        elif not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = datetime.now(timezone.utc)
            progress = self.progress_repo.update(progress)

        self._maybe_mark_course_completed(enrollment, course_id)
        return progress

    def get_course_progress(self, course_id: uuid.UUID, student_id: uuid.UUID) -> CourseProgressOut:
        enrollment = self.enrollment_repo.get(student_id, course_id)
        if not enrollment:
            raise ForbiddenError("You must be enrolled in this course to view progress")

        all_lessons = self.lesson_repo.list_for_course(course_id)
        progress_records = self.progress_repo.list_for_enrollment(enrollment.id)
        completed_ids = [record.lesson_id for record in progress_records if record.is_completed]

        total = len(all_lessons)
        completed = len(completed_ids)
        percentage = round((completed / total) * 100, 2) if total > 0 else 0.0

        return CourseProgressOut(
            course_id=course_id,
            total_lessons=total,
            completed_lessons=completed,
            percentage=percentage,
            completed_lesson_ids=completed_ids,
        )

    def _maybe_mark_course_completed(self, enrollment, course_id: uuid.UUID) -> None:
        if enrollment.completed_at is not None:
            return

        all_lessons = self.lesson_repo.list_for_course(course_id)
        if not all_lessons:
            return

        progress_records = self.progress_repo.list_for_enrollment(enrollment.id)
        completed_ids = {record.lesson_id for record in progress_records if record.is_completed}

        if all(lesson.id in completed_ids for lesson in all_lessons):
            enrollment.completed_at = datetime.now(timezone.utc)
            self.enrollment_repo.update(enrollment)
