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

    course_payload = {
        "title": "Intro to Testing",
        "description": "Learn how to write good tests",
        "category_id": category_id,
        "level": "beginner",
        "language": "French",
        "price": "0",
    }
    course_id = client.post(
        "/courses", json=course_payload, headers={"Authorization": f"Bearer {instructor_token}"}
    ).json()["id"]

    return {
        "admin_token": admin_token,
        "instructor_token": instructor_token,
        "student_token": student_token,
        "course_id": course_id,
    }


def test_cannot_pay_for_unpublished_course(client, setup):
    headers = {"Authorization": f"Bearer {setup['student_token']}"}
    response = client.post(f"/courses/{setup['course_id']}/pay", headers=headers)
    assert response.status_code == 404


def test_pay_enrolls_in_published_course(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    response = client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["course_id"] == setup["course_id"]
    assert data["status"] == "succeeded"

    my_courses = client.get("/my-courses", headers=student_headers).json()
    assert my_courses[0]["course"]["id"] == setup["course_id"]


def test_cannot_pay_twice(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)
    response = client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)
    assert response.status_code == 409


def test_my_courses_lists_enrollments(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)

    response = client.get("/my-courses", headers=student_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_instructor_gets_notification_on_enrollment(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    student_headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/courses/{setup['course_id']}/pay", headers=student_headers)

    response = client.get("/notifications", headers=instructor_headers)
    notifications = response.json()
    assert any(n["type"] == "new_enrollment" for n in notifications)
