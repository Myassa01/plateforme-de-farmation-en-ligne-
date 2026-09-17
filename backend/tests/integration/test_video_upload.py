import io

import pytest

from app.models.user import UserRole
from tests.conftest import register_and_login


@pytest.fixture
def setup(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    instructor_token = register_and_login(
        client, db_session, "instructor@example.com", role=UserRole.INSTRUCTOR
    )

    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}

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
        headers=instructor_headers,
    ).json()["id"]

    section_id = client.post(
        f"/courses/{course_id}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]

    lesson_id = client.post(
        f"/sections/{section_id}/lessons", json={"title": "Lesson 1"}, headers=instructor_headers
    ).json()["id"]

    return {"instructor_headers": instructor_headers, "lesson_id": lesson_id}


def test_instructor_can_upload_video(client, setup):
    fake_video = io.BytesIO(b"fake mp4 content")
    response = client.post(
        f"/lessons/{setup['lesson_id']}/video",
        files={"file": ("clip.mp4", fake_video, "video/mp4")},
        headers=setup["instructor_headers"],
    )
    assert response.status_code == 200
    data = response.json()
    assert data["video_url"].startswith("/media/videos/")
    assert data["video_url"].endswith(".mp4")


def test_upload_rejects_non_video_files(client, setup):
    fake_file = io.BytesIO(b"not a video")
    response = client.post(
        f"/lessons/{setup['lesson_id']}/video",
        files={"file": ("doc.pdf", fake_file, "application/pdf")},
        headers=setup["instructor_headers"],
    )
    assert response.status_code == 409


def test_upload_requires_ownership(client, setup, db_session):
    other_token = register_and_login(
        client, db_session, "other_instructor@example.com", role=UserRole.INSTRUCTOR
    )
    fake_video = io.BytesIO(b"fake mp4 content")
    response = client.post(
        f"/lessons/{setup['lesson_id']}/video",
        files={"file": ("clip.mp4", fake_video, "video/mp4")},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 403


def test_student_cannot_upload_video(client, setup, db_session):
    student_token = register_and_login(client, db_session, "student@example.com")
    fake_video = io.BytesIO(b"fake mp4 content")
    response = client.post(
        f"/lessons/{setup['lesson_id']}/video",
        files={"file": ("clip.mp4", fake_video, "video/mp4")},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 403
