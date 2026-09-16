import pytest

from app.models.user import UserRole
from tests.conftest import register_and_login


@pytest.fixture
def setup(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    instructor_token = register_and_login(
        client, db_session, "instructor@example.com", role=UserRole.INSTRUCTOR
    )
    student_token = register_and_login(client, db_session, "student@example.com")

    category_id = client.post(
        "/categories",
        json={"name": "Programming"},
        headers={"Authorization": f"Bearer {admin_token}"},
    ).json()["id"]

    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}
    course_id = client.post(
        "/courses",
        json={
            "title": "Intro to Testing",
            "description": "Learn how to write good tests",
            "category_id": category_id,
            "level": "beginner",
            "language": "French",
            "price": "0",
        },
        headers=instructor_headers,
    ).json()["id"]

    section_id = client.post(
        f"/courses/{course_id}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]

    lesson1_id = client.post(
        f"/sections/{section_id}/lessons", json={"title": "Lesson 1"}, headers=instructor_headers
    ).json()["id"]
    lesson2_id = client.post(
        f"/sections/{section_id}/lessons", json={"title": "Lesson 2"}, headers=instructor_headers
    ).json()["id"]

    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    client.post(f"/courses/{course_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})

    student_headers = {"Authorization": f"Bearer {student_token}"}
    client.post(f"/courses/{course_id}/enroll", headers=student_headers)

    return {
        "course_id": course_id,
        "lesson1_id": lesson1_id,
        "lesson2_id": lesson2_id,
        "student_headers": student_headers,
    }


def test_complete_lesson_requires_enrollment(client, db_session, setup):
    other_token = register_and_login(client, db_session, "other@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    response = client.post(f"/lessons/{setup['lesson1_id']}/complete", headers=other_headers)
    assert response.status_code == 403


def test_complete_lesson_and_check_progress(client, setup):
    headers = setup["student_headers"]
    response = client.post(f"/lessons/{setup['lesson1_id']}/complete", headers=headers)
    assert response.status_code == 200
    assert response.json()["is_completed"] is True

    progress_response = client.get(f"/courses/{setup['course_id']}/progress", headers=headers)
    data = progress_response.json()
    assert data["total_lessons"] == 2
    assert data["completed_lessons"] == 1
    assert data["percentage"] == 50.0


def test_completing_all_lessons_marks_course_completed(client, setup):
    headers = setup["student_headers"]
    client.post(f"/lessons/{setup['lesson1_id']}/complete", headers=headers)
    client.post(f"/lessons/{setup['lesson2_id']}/complete", headers=headers)

    progress_response = client.get(f"/courses/{setup['course_id']}/progress", headers=headers)
    data = progress_response.json()
    assert data["percentage"] == 100.0

    my_courses = client.get("/my-courses", headers=headers).json()
    enrollment = next(e for e in my_courses if e["course"]["id"] == setup["course_id"])
    assert enrollment["completed_at"] is not None


def test_complete_lesson_twice_is_idempotent(client, setup):
    headers = setup["student_headers"]
    client.post(f"/lessons/{setup['lesson1_id']}/complete", headers=headers)
    response = client.post(f"/lessons/{setup['lesson1_id']}/complete", headers=headers)
    assert response.status_code == 200

    progress_response = client.get(f"/courses/{setup['course_id']}/progress", headers=headers)
    assert progress_response.json()["completed_lessons"] == 1
