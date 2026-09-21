import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.certificate import Certificate
from app.models.course import Course, CourseStatus
from app.models.enrollment import Enrollment
from app.models.payment import Payment, PaymentStatus
from app.models.quiz_attempt import QuizAttempt
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.course import CourseListItem
from app.schemas.enrollment import EnrollmentOut
from app.schemas.stats import AdminStats, InstructorStats, StudentStats


class StatsService:
    def __init__(self, db: Session):
        self.db = db

    def get_student_stats(self, student_id: uuid.UUID) -> StudentStats:
        enrollments = list(
            self.db.scalars(
                select(Enrollment)
                .where(Enrollment.student_id == student_id)
                .order_by(Enrollment.enrolled_at.desc())
            ).all()
        )
        courses_completed = sum(1 for e in enrollments if e.completed_at is not None)
        courses_in_progress = len(enrollments) - courses_completed

        avg_score = self.db.scalar(
            select(func.avg(QuizAttempt.score)).where(QuizAttempt.student_id == student_id)
        )

        certificates_count = self.db.scalar(
            select(func.count(Certificate.id)).where(Certificate.student_id == student_id)
        ) or 0

        continue_learning = [
            EnrollmentOut.model_validate(e) for e in enrollments if e.completed_at is None
        ][:5]

        return StudentStats(
            courses_in_progress=courses_in_progress,
            courses_completed=courses_completed,
            certificates_count=certificates_count,
            average_quiz_score=round(float(avg_score), 1) if avg_score is not None else 0.0,
            continue_learning=continue_learning,
        )

    def get_instructor_stats(self, instructor_id: uuid.UUID) -> InstructorStats:
        courses = list(
            self.db.scalars(
                select(Course).where(Course.instructor_id == instructor_id)
            ).all()
        )
        course_ids = [c.id for c in courses]

        published_courses = sum(1 for c in courses if c.status == CourseStatus.PUBLISHED)
        pending_courses = sum(1 for c in courses if c.status == CourseStatus.PENDING)
        draft_courses = sum(1 for c in courses if c.status == CourseStatus.DRAFT)

        total_students = 0
        total_revenue = Decimal("0")
        if course_ids:
            total_students = self.db.scalar(
                select(func.count(func.distinct(Enrollment.student_id))).where(
                    Enrollment.course_id.in_(course_ids)
                )
            ) or 0

            total_revenue = self.db.scalar(
                select(func.coalesce(func.sum(Payment.amount), 0)).where(
                    Payment.course_id.in_(course_ids),
                    Payment.status == PaymentStatus.SUCCEEDED,
                )
            ) or Decimal("0")

        avg_rating = None
        if course_ids:
            avg_rating = self.db.scalar(
                select(func.avg(Review.rating)).where(Review.course_id.in_(course_ids))
            )

        top_courses = sorted(
            [c for c in courses if c.status == CourseStatus.PUBLISHED],
            key=lambda c: c.created_at,
            reverse=True,
        )[:5]

        return InstructorStats(
            total_courses=len(courses),
            published_courses=published_courses,
            pending_courses=pending_courses,
            draft_courses=draft_courses,
            total_students=total_students,
            total_revenue=Decimal(total_revenue),
            average_rating=round(float(avg_rating), 1) if avg_rating is not None else 0.0,
            top_courses=[CourseListItem.model_validate(c) for c in top_courses],
        )

    def get_admin_stats(self) -> AdminStats:
        total_users = self.db.scalar(select(func.count(User.id))) or 0
        total_students = self.db.scalar(
            select(func.count(User.id)).where(User.role == UserRole.STUDENT)
        ) or 0
        total_instructors = self.db.scalar(
            select(func.count(User.id)).where(User.role == UserRole.INSTRUCTOR)
        ) or 0

        total_courses = self.db.scalar(select(func.count(Course.id))) or 0
        pending_courses = self.db.scalar(
            select(func.count(Course.id)).where(Course.status == CourseStatus.PENDING)
        ) or 0
        published_courses = self.db.scalar(
            select(func.count(Course.id)).where(Course.status == CourseStatus.PUBLISHED)
        ) or 0

        total_enrollments = self.db.scalar(select(func.count(Enrollment.id))) or 0

        total_revenue = self.db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status == PaymentStatus.SUCCEEDED
            )
        ) or Decimal("0")

        recent_pending = list(
            self.db.scalars(
                select(Course)
                .where(Course.status == CourseStatus.PENDING)
                .order_by(Course.created_at.desc())
                .limit(5)
            ).all()
        )

        return AdminStats(
            total_users=total_users,
            total_students=total_students,
            total_instructors=total_instructors,
            total_courses=total_courses,
            pending_courses=pending_courses,
            published_courses=published_courses,
            total_enrollments=total_enrollments,
            total_revenue=Decimal(total_revenue),
            recent_pending_courses=[CourseListItem.model_validate(c) for c in recent_pending],
        )
