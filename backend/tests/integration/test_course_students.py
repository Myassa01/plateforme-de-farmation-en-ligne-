import pytest

from app.models.user import UserRole
from tests.conftest import register_and_login


@pytest.fixture
def setup(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    instructor_token = register_and_login(
        client, db_session, "instructor@example.com", role=UserRole.INSTRUCTOR
    )
    other_instructor_token = register_and_login(
        client, db_session, "other-instructor@example.com", role=UserRole.INSTRUCTOR
    )
    student_token = register_and_login(client, db_session, "student@example.com")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}
    other_instructor_headers = {"Authorization": f"Bearer {other_instructor_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    category_id = client.post(
        "/categories", json={"name": "Programming"}, headers=admin_headers
    ).json()["id"]

    course_id = client.post(
        "/courses",
        json={
            "title": "Course With Students",
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
    client.post(f"/courses/{course_id}/pay", headers=student_headers)

    return {
        "course_id": course_id,
        "admin_headers": admin_headers,
        "instructor_headers": instructor_headers,
        "other_instructor_headers": other_instructor_headers,
        "student_headers": student_headers,
    }


def test_owning_instructor_can_list_students(client, setup):
    response = client.get(
        f"/courses/{setup['course_id']}/students", headers=setup["instructor_headers"]
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["student"]["email"] == "student@example.com"


def test_admin_can_list_students_for_any_course(client, setup):
    response = client.get(f"/courses/{setup['course_id']}/students", headers=setup["admin_headers"])
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_other_instructor_cannot_list_students(client, setup):
    response = client.get(
        f"/courses/{setup['course_id']}/students", headers=setup["other_instructor_headers"]
    )
    assert response.status_code == 403


def test_student_cannot_list_course_students(client, setup):
    response = client.get(
        f"/courses/{setup['course_id']}/students", headers=setup["student_headers"]
    )
    assert response.status_code == 403
