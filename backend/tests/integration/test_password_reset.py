from unittest.mock import patch

from app.core.security import verify_password
from app.models.user import User
from tests.conftest import register_and_login


def test_forgot_password_does_not_reveal_unknown_email(client):
    response = client.post("/auth/forgot-password", json={"email": "unknown@example.com"})
    assert response.status_code == 204


@patch("app.services.password_reset_service.EmailService.send_password_reset_email")
def test_forgot_password_sends_email_for_known_user(mock_send, client, db_session):
    register_and_login(client, db_session, "alice@example.com")

    response = client.post("/auth/forgot-password", json={"email": "alice@example.com"})
    assert response.status_code == 204
    mock_send.assert_called_once()
    call_args = mock_send.call_args
    assert call_args[0][0] == "alice@example.com"
    assert "reset-password?token=" in call_args[0][1]


@patch("app.services.password_reset_service.EmailService.send_password_reset_email")
def test_reset_password_with_valid_token(mock_send, client, db_session):
    register_and_login(client, db_session, "bob@example.com")
    client.post("/auth/forgot-password", json={"email": "bob@example.com"})

    reset_link = mock_send.call_args[0][1]
    token = reset_link.split("token=")[1]

    response = client.post(
        "/auth/reset-password", json={"token": token, "new_password": "NewSecurePass456"}
    )
    assert response.status_code == 204

    login_response = client.post(
        "/auth/login", json={"email": "bob@example.com", "password": "NewSecurePass456"}
    )
    assert login_response.status_code == 200

    old_login_response = client.post(
        "/auth/login", json={"email": "bob@example.com", "password": "SecurePass123"}
    )
    assert old_login_response.status_code == 401


@patch("app.services.password_reset_service.EmailService.send_password_reset_email")
def test_reset_token_cannot_be_reused(mock_send, client, db_session):
    register_and_login(client, db_session, "carol@example.com")
    client.post("/auth/forgot-password", json={"email": "carol@example.com"})
    token = mock_send.call_args[0][1].split("token=")[1]

    first = client.post(
        "/auth/reset-password", json={"token": token, "new_password": "NewSecurePass456"}
    )
    assert first.status_code == 204

    second = client.post(
        "/auth/reset-password", json={"token": token, "new_password": "AnotherPass789"}
    )
    assert second.status_code == 401


def test_reset_password_with_invalid_token(client):
    response = client.post(
        "/auth/reset-password", json={"token": "not-a-real-token", "new_password": "NewSecurePass456"}
    )
    assert response.status_code == 401


@patch("app.services.password_reset_service.EmailService.send_password_reset_email")
def test_reset_password_updates_hash(mock_send, client, db_session):
    register_and_login(client, db_session, "dave@example.com")
    client.post("/auth/forgot-password", json={"email": "dave@example.com"})
    token = mock_send.call_args[0][1].split("token=")[1]

    client.post("/auth/reset-password", json={"token": token, "new_password": "NewSecurePass456"})

    user = db_session.query(User).filter(User.email == "dave@example.com").first()
    assert verify_password("NewSecurePass456", user.hashed_password)
