def _register_and_login(client, email, role="student"):
    client.post(
        "/auth/register",
        json={
            "email": email,
            "full_name": "Test User",
            "password": "SecurePass123",
            "role": role,
        },
    )
    login = client.post("/auth/login", json={"email": email, "password": "SecurePass123"})
    return login.json()["access_token"]


def test_list_categories_empty(client):
    response = client.get("/categories")
    assert response.status_code == 200
    assert response.json() == []


def test_create_category_requires_admin(client):
    token = _register_and_login(client, "student1@example.com", role="student")
    response = client.post(
        "/categories",
        json={"name": "Web Development"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_admin_can_create_category(client):
    token = _register_and_login(client, "admin1@example.com", role="admin")
    response = client.post(
        "/categories",
        json={"name": "Web Development", "description": "Learn to build websites"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Web Development"
    assert data["slug"] == "web-development"


def test_create_duplicate_category_fails(client):
    token = _register_and_login(client, "admin2@example.com", role="admin")
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/categories", json={"name": "Design"}, headers=headers)
    response = client.post("/categories", json={"name": "Design"}, headers=headers)
    assert response.status_code == 409
