from app.models.user import UserRole
from tests.conftest import register_and_login


def test_list_categories_empty(client):
    response = client.get("/categories")
    assert response.status_code == 200
    assert response.json() == []


def test_create_category_requires_admin(client, db_session):
    token = register_and_login(client, db_session, "student1@example.com")
    response = client.post(
        "/categories",
        json={"name": "Web Development"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_admin_can_create_category(client, db_session):
    token = register_and_login(client, db_session, "admin1@example.com", role=UserRole.ADMIN)
    response = client.post(
        "/categories",
        json={"name": "Web Development", "description": "Learn to build websites"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Web Development"
    assert data["slug"] == "web-development"


def test_create_duplicate_category_fails(client, db_session):
    token = register_and_login(client, db_session, "admin2@example.com", role=UserRole.ADMIN)
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/categories", json={"name": "Design"}, headers=headers)
    response = client.post("/categories", json={"name": "Design"}, headers=headers)
    assert response.status_code == 409
