import pytest

from app.models.user import UserRole
from tests.conftest import register_and_login


@pytest.fixture
def setup(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    instructor_token = register_and_login(
        client, db_session, "instructor@example.com", role=UserRole.INSTRUCTOR
    )

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

    return {"admin_token": admin_token, "instructor_token": instructor_token, "course_id": course_id}


def test_instructor_notified_on_approval(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    response = client.get("/notifications", headers=instructor_headers)
    assert response.status_code == 200
    notifications = response.json()
    assert len(notifications) == 1
    assert notifications[0]["type"] == "course_approved"
    assert notifications[0]["is_read"] is False


def test_mark_notification_as_read(client, setup):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    notification_id = client.get("/notifications", headers=instructor_headers).json()[0]["id"]
    response = client.patch(f"/notifications/{notification_id}/read", headers=instructor_headers)
    assert response.status_code == 200
    assert response.json()["is_read"] is True


def test_cannot_mark_others_notification_as_read(client, setup, db_session):
    instructor_headers = {"Authorization": f"Bearer {setup['instructor_token']}"}
    admin_headers = {"Authorization": f"Bearer {setup['admin_token']}"}

    client.post(f"/courses/{setup['course_id']}/submit", headers=instructor_headers)
    client.post(f"/courses/{setup['course_id']}/approve", headers=admin_headers)

    notification_id = client.get("/notifications", headers=instructor_headers).json()[0]["id"]

    other_token = register_and_login(client, db_session, "other@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    response = client.patch(f"/notifications/{notification_id}/read", headers=other_headers)
    assert response.status_code == 403
