"""Seed the database with demo accounts for local development.

Usage:
    python -m app.utils.seed
"""

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.user import User, UserRole

DEMO_USERS = [
    {
        "email": "admin@learnhub.dev",
        "full_name": "Admin LearnHub",
        "password": "Admin123!",
        "role": UserRole.ADMIN,
    },
    {
        "email": "instructor@learnhub.dev",
        "full_name": "Jane Instructor",
        "password": "Instructor123!",
        "role": UserRole.INSTRUCTOR,
    },
    {
        "email": "student@learnhub.dev",
        "full_name": "John Student",
        "password": "Student123!",
        "role": UserRole.STUDENT,
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        for data in DEMO_USERS:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if existing:
                print(f"Skipped (already exists): {data['email']}")
                continue

            user = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
            )
            db.add(user)
            print(f"Created: {data['email']} ({data['role'].value})")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
