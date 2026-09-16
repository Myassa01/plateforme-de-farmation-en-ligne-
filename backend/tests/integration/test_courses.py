import pytest

from app.models.user import UserRole
from tests.conftest import register_and_login


def _create_category(client, admin_token):
    response = client.post(
        "/categories",
        json={"name": "Programming"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    return response.json()["id"]


@pytest.fixture
def setup(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    instructor_token = register_and_login(
        client, db_session, "instructor@example.com", role=UserRole.INSTRUCTOR
    )
    student_token = register_and_login(client, db_session, "student@example.com")
    category_id = _create_category(client, admin_token)
    return {
        "admin_token": admin_token,
        "instructor_token": instructor_token,
        "student_token": student_token,
        "category_id": category_id,
    }


def _course_payload(category_id):
    return {
        "title": "Introduction to Python",
        "description": "A complete beginner course on Python programming",
        "category_id": category_id,
        "level": "beginner",
        "language": "French",
        "price": "29.99",
    }


def test_instructor_can_create_draft_course(client, setup):
    response = client.post(
        "/courses",
        json=_course_payload(setup["category_id"]),
        headers={"Authorization": f"Bearer {setup['instructor_token']}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "draft"
    assert data["slug"] == "introduction-to-python"
    assert data["instructor"]["full_name"] == "Test User"


def test_student_cannot_create_course(client, setup):
    response = client.post(
        "/courses",
        json=_course_payload(setup["category_id"]),
        headers={"Authorization": f"Bearer {setup['student_token']}"},
    )
    assert response.status_code == 403


def test_draft_course_not_visible_in_public_list(client, setup):
    client.post(
        "/courses",
        json=_course_payload(setup["category_id"]),
        headers={"Authorization": f"Bearer {setup['instructor_token']}"},
    )
    response = client.get("/courses")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_full_publish_workflow(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    create_response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)
    course_id = create_response.json()["id"]

    submit_response = client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    assert submit_response.status_code == 200
    assert submit_response.json()["status"] == "pending"

    pending_response = client.get("/admin/courses/pending", headers=admin_headers)
    assert pending_response.json()["total"] == 1

    approve_response = client.post(f"/courses/{course_id}/approve", headers=admin_headers)
    assert approve_response.status_code == 200
    assert approve_response.json()["status"] == "published"

    public_response = client.get("/courses")
    assert public_response.json()["total"] == 1


def test_reject_course_requires_reason(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    create_response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)
    course_id = create_response.json()["id"]
    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)

    reject_response = client.post(
        f"/courses/{course_id}/reject",
        json={"reason": "Content quality does not meet our standards"},
        headers=admin_headers,
    )
    assert reject_response.status_code == 200
    assert reject_response.json()["status"] == "rejected"


def test_other_instructor_cannot_edit_course(client, setup, db_session):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    create_response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)
    course_id = create_response.json()["id"]

    other_token = register_and_login(
        client, db_session, "other_instructor@example.com", role=UserRole.INSTRUCTOR
    )
    other_headers = {"Authorization": f"Bearer {other_token}"}

    response = client.patch(
        f"/courses/{course_id}",
        json={"title": "Hacked title"},
        headers=other_headers,
    )
    assert response.status_code == 403


def test_search_and_filter_courses(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    create_response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)
    course_id = create_response.json()["id"]
    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    client.post(f"/courses/{course_id}/approve", headers=admin_headers)

    response = client.get("/courses", params={"search": "Python"})
    assert response.json()["total"] == 1

    response = client.get("/courses", params={"search": "Nonexistent"})
    assert response.json()["total"] == 0

    response = client.get("/courses", params={"level": "beginner"})
    assert response.json()["total"] == 1

    response = client.get("/courses", params={"min_price": "100"})
    assert response.json()["total"] == 0


def test_admin_can_create_course(client, setup):
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}
    response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=admin_headers)
    assert response.status_code == 201


def test_admin_can_edit_and_delete_any_course(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    create_response = client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)
    course_id = create_response.json()["id"]

    update_response = client.patch(
        f"/courses/{course_id}", json={"title": "Updated by admin"}, headers=admin_headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated by admin"

    delete_response = client.delete(f"/courses/{course_id}", headers=admin_headers)
    assert delete_response.status_code == 204


def test_admin_all_courses_listing_includes_drafts(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    client.post("/courses", json=_course_payload(setup["category_id"]), headers=instructor_headers)

    response = client.get("/admin/courses", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 1
