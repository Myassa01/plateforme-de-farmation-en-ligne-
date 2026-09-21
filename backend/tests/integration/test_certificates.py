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
    other_student_token = register_and_login(client, db_session, "other-student@example.com")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}
    other_student_headers = {"Authorization": f"Bearer {other_student_token}"}

    student_id = client.get("/auth/me", headers=student_headers).json()["id"]

    category_id = client.post(
        "/categories", json={"name": "Programming"}, headers=admin_headers
    ).json()["id"]

    course_id = client.post(
        "/courses",
        json={
            "title": "Course With Certificate",
            "description": "A detailed course description for testing.",
            "category_id": category_id,
            "level": "beginner",
            "language": "French",
            "price": "0",
        },
        headers=instructor_headers,
    ).json()["id"]
    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    client.post(f"/courses/{course_id}/approve", headers=admin_headers)

    return {
        "course_id": course_id,
        "student_id": student_id,
        "admin_headers": admin_headers,
        "student_headers": student_headers,
        "other_student_headers": other_student_headers,
        "instructor_headers": instructor_headers,
    }


def test_admin_can_create_certificate(client, setup):
    response = client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["student"]["id"] == setup["student_id"]
    assert data["course"]["id"] == setup["course_id"]


def test_certificate_appears_on_student_profile(client, setup):
    client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    response = client.get("/certificates/me", headers=setup["student_headers"])
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["course"]["id"] == setup["course_id"]


def test_certificate_not_visible_to_other_students(client, setup):
    client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    response = client.get("/certificates/me", headers=setup["other_student_headers"])
    assert response.status_code == 200
    assert response.json() == []


def test_duplicate_certificate_rejected(client, setup):
    client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    response = client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    assert response.status_code == 409


def test_admin_can_list_all_certificates(client, setup):
    client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["admin_headers"],
    )
    response = client.get("/certificates", headers=setup["admin_headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_non_admin_cannot_create_certificate(client, setup):
    response = client.post(
        "/certificates",
        json={"student_id": setup["student_id"], "course_id": setup["course_id"]},
        headers=setup["instructor_headers"],
    )
    assert response.status_code == 403
