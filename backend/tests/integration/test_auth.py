def test_register_creates_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "alice@example.com",
            "full_name": "Alice Doe",
            "password": "SecurePass123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "student"
    assert "hashed_password" not in data


def test_register_duplicate_email_fails(client):
    payload = {
        "email": "bob@example.com",
        "full_name": "Bob Doe",
        "password": "SecurePass123",
    }
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409


def test_login_returns_tokens(client):
    client.post(
        "/auth/register",
        json={
            "email": "carol@example.com",
            "full_name": "Carol Doe",
            "password": "SecurePass123",
        },
    )
    response = client.post(
        "/auth/login",
        json={"email": "carol@example.com", "password": "SecurePass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password_fails(client):
    client.post(
        "/auth/register",
        json={
            "email": "dave@example.com",
            "full_name": "Dave Doe",
            "password": "SecurePass123",
        },
    )
    response = client.post(
        "/auth/login",
        json={"email": "dave@example.com", "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_get_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_with_valid_token(client):
    client.post(
        "/auth/register",
        json={
            "email": "erin@example.com",
            "full_name": "Erin Doe",
            "password": "SecurePass123",
        },
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "erin@example.com", "password": "SecurePass123"},
    )
    token = login_response.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "erin@example.com"
    assert response.json()["role"] == "student"


def test_refresh_token_flow(client):
    client.post(
        "/auth/register",
        json={
            "email": "frank@example.com",
            "full_name": "Frank Doe",
            "password": "SecurePass123",
        },
    )
    login_response = client.post(
        "/auth/login",
        json={"email": "frank@example.com", "password": "SecurePass123"},
    )
    refresh_token = login_response.json()["refresh_token"]

    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    assert "access_token" in response.json()
