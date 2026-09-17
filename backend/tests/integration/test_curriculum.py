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
        headers={"Authorization": f"Bearer {instructor_token}"},
    ).json()["id"]

    return {
        "admin_token": admin_token,
        "instructor_token": instructor_token,
        "student_token": student_token,
        "course_id": course_id,
    }


def test_instructor_can_create_section_and_lesson(client, setup):
    headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    section_response = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=headers
    )
    assert section_response.status_code == 201
    section_id = section_response.json()["id"]

    lesson_response = client.post(
        f"/sections/{section_id}/lessons",
        json={"title": "Lesson 1", "video_url": "https://example.com/v1.mp4", "duration_seconds": 300},
        headers=headers,
    )
    assert lesson_response.status_code == 201
    assert lesson_response.json()["order_index"] == 0


def test_student_cannot_create_section(client, setup):
    headers = {"Authorization": f"Bearer {setup['student_token']}"}
    response = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=headers
    )
    assert response.status_code == 403


def test_other_instructor_cannot_add_lesson(client, setup, db_session):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    section_id = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]

    other_token = register_and_login(
        client, db_session, "other_instructor@example.com", role=UserRole.INSTRUCTOR
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}
    response = client.post(
        f"/sections/{section_id}/lessons", json={"title": "Hacked lesson"}, headers=other_headers
    )
    assert response.status_code == 403


def test_curriculum_hides_video_url_for_non_enrolled(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    section_id = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]
    client.post(
        f"/sections/{section_id}/lessons",
        json={
            "title": "Lesson 1",
            "video_url": "https://example.com/v1.mp4",
            "duration_seconds": 300,
            "is_preview": False,
        },
        headers=instructor_headers,
    )

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    response = client.get(f"/courses/{setup['course_id']}/curriculum", headers=student_headers)
    assert response.status_code == 200
    lessons = response.json()[0]["lessons"]
    assert lessons[0]["video_url"] is None


def test_curriculum_shows_preview_lesson_to_anyone(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    section_id = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]
    client.post(
        f"/sections/{section_id}/lessons",
        json={
            "title": "Preview Lesson",
            "video_url": "https://example.com/preview.mp4",
            "duration_seconds": 120,
            "is_preview": True,
        },
        headers=instructor_headers,
    )

    response = client.get(f"/courses/{setup['course_id']}/curriculum")
    assert response.status_code == 200
    lessons = response.json()[0]["lessons"]
    assert lessons[0]["video_url"] == "https://example.com/preview.mp4"


def test_curriculum_shows_full_video_to_enrolled_student(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    section_id = client.post(
        f"/courses/{setup['course_id']}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]
    client.post(
        f"/sections/{section_id}/lessons",
        json={"title": "Lesson 1", "video_url": "https://example.com/v1.mp4", "duration_seconds": 300},
        headers=instructor_headers,
    )
    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)

    response = client.get(f"/courses/{setup['course_id']}/curriculum", headers=student_headers)
    lessons = response.json()[0]["lessons"]
    assert lessons[0]["video_url"] == "https://example.com/v1.mp4"
