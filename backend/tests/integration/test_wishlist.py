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

    course_response = client.post(
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
    )
    course_id = course_response.json()["id"]

    return {
        "student_token": student_token,
        "course_id": course_id,
    }


def test_add_to_wishlist(client, setup):
    headers = {"Authorization": f"Bearer {setup['student_token']}"}
    response = client.post(f"/wishlist/{setup['course_id']}", headers=headers)
    assert response.status_code == 201
    assert response.json()["course"]["id"] == setup["course_id"]


def test_add_duplicate_to_wishlist_fails(client, setup):
    headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/wishlist/{setup['course_id']}", headers=headers)
    response = client.post(f"/wishlist/{setup['course_id']}", headers=headers)
    assert response.status_code == 409


def test_list_and_remove_wishlist(client, setup):
    headers = {"Authorization": f"Bearer {setup['student_token']}"}
    client.post(f"/wishlist/{setup['course_id']}", headers=headers)

    list_response = client.get("/wishlist", headers=headers)
    assert len(list_response.json()) == 1

    delete_response = client.delete(f"/wishlist/{setup['course_id']}", headers=headers)
    assert delete_response.status_code == 204

    list_response = client.get("/wishlist", headers=headers)
    assert len(list_response.json()) == 0
