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

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    category_id = client.post(
        "/categories", json={"name": "Programming"}, headers=admin_headers
    ).json()["id"]

    course_id = client.post(
        "/courses",
        json={
            "title": "Paid Course",
            "description": "A course that costs money",
            "category_id": category_id,
            "level": "beginner",
            "language": "French",
            "price": "49.99",
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
        "student_headers": student_headers,
    }


def test_student_stats_reflects_enrollment(client, setup):
    response = client.get("/stats/student", headers=setup["student_headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["courses_in_progress"] == 1
    assert data["courses_completed"] == 0
    assert len(data["continue_learning"]) == 1


def test_instructor_stats_reflects_revenue_and_students(client, setup):
    response = client.get("/stats/instructor", headers=setup["instructor_headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["total_courses"] == 1
    assert data["published_courses"] == 1
    assert data["total_students"] == 1
    assert data["total_revenue"] == "49.99"


def test_admin_stats_reflects_platform_totals(client, setup):
    response = client.get("/stats/admin", headers=setup["admin_headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] == 3
    assert data["total_courses"] == 1
    assert data["published_courses"] == 1
    assert data["total_enrollments"] == 1
    assert data["total_revenue"] == "49.99"


def test_stats_are_role_scoped(client, setup):
    assert client.get("/stats/student", headers=setup["instructor_headers"]).status_code == 403
    assert client.get("/stats/instructor", headers=setup["student_headers"]).status_code == 403
    assert client.get("/stats/admin", headers=setup["student_headers"]).status_code == 403
