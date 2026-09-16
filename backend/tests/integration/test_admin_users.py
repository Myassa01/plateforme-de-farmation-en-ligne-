from app.models.user import UserRole
from tests.conftest import register_and_login


def test_list_users_requires_admin(client, db_session):
    token = register_and_login(client, db_session, "student@example.com")
    response = client.get("/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_can_list_users(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    register_and_login(client, db_session, "student1@example.com")
    register_and_login(client, db_session, "student2@example.com")

    response = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["total"] == 3


def test_admin_can_promote_user_to_instructor(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    register_and_login(client, db_session, "future_instructor@example.com")

    users = client.get(
        "/admin/users", params={"role": "student"}, headers={"Authorization": f"Bearer {admin_token}"}
    ).json()["items"]
    user_id = next(u["id"] for u in users if u["email"] == "future_instructor@example.com")

    response = client.patch(
        f"/admin/users/{user_id}/role",
        json={"role": "instructor"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "instructor"


def test_admin_cannot_change_own_role(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {admin_token}"}).json()

    response = client.patch(
        f"/admin/users/{me['id']}/role",
        json={"role": "student"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 409


def test_admin_can_deactivate_user(client, db_session):
    admin_token = register_and_login(client, db_session, "admin@example.com", role=UserRole.ADMIN)
    register_and_login(client, db_session, "student@example.com")

    users = client.get("/admin/users", headers={"Authorization": f"Bearer {admin_token}"}).json()["items"]
    user_id = next(u["id"] for u in users if u["email"] == "student@example.com")

    response = client.patch(
        f"/admin/users/{user_id}/deactivate",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False
