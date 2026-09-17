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

    return {"course_id": course_id, "student_headers": student_headers}


def test_payment_records_course_price(client, setup):
    response = client.post(f"/courses/{setup['course_id']}/pay", headers=setup["student_headers"])
    assert response.status_code == 201
    data = response.json()
    assert data["amount"] == "49.99"
    assert data["method"] == "simulated"
    assert data["status"] == "succeeded"


def test_payment_does_not_expose_card_fields(client, setup):
    response = client.post(f"/courses/{setup['course_id']}/pay", headers=setup["student_headers"])
    data = response.json()
    assert "card_last4" not in data
    assert "card_number" not in data


def test_payment_grants_immediate_access(client, setup):
    client.post(f"/courses/{setup['course_id']}/pay", headers=setup["student_headers"])
    response = client.get(
        f"/courses/{setup['course_id']}/curriculum", headers=setup["student_headers"]
    )
    assert response.status_code == 200
