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
            "title": "Intro to Testing",
            "description": "Learn how to write good tests",
            "category_id": category_id,
            "level": "beginner",
            "language": "French",
            "price": "0",
        },
        headers=instructor_headers,
    ).json()["id"]

    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    client.post(f"/courses/{course_id}/approve", headers=admin_headers)

    return {
        "course_id": course_id,
        "student_headers": student_headers,
        "instructor_headers": instructor_headers,
        "admin_headers": admin_headers,
    }


def test_cannot_review_without_enrollment(client, setup):
    response = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 5, "comment": "Great course"},
        headers=setup["student_headers"],
    )
    assert response.status_code == 403


def test_enrolled_student_can_review(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])

    response = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 5, "comment": "Great course"},
        headers=setup["student_headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 5
    assert data["comment"] == "Great course"
    assert data["student"]["full_name"] == "Test User"


def test_cannot_review_twice(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 4},
        headers=setup["student_headers"],
    )
    response = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 5},
        headers=setup["student_headers"],
    )
    assert response.status_code == 409


def test_rating_summary_calculates_average(client, setup, db_session):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 4},
        headers=setup["student_headers"],
    )

    other_token = register_and_login(client, db_session, "other_student@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}
    client.post(f"/courses/{setup['course_id']}/enroll", headers=other_headers)
    client.post(
        f"/courses/{setup['course_id']}/reviews", json={"rating": 2}, headers=other_headers
    )

    response = client.get(f"/courses/{setup['course_id']}/reviews/summary")
    data = response.json()
    assert data["average_rating"] == 3.0
    assert data["total_reviews"] == 2


def test_rating_out_of_bounds_rejected(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    response = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 6},
        headers=setup["student_headers"],
    )
    assert response.status_code == 422


def test_student_can_update_own_review(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    review_id = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 3},
        headers=setup["student_headers"],
    ).json()["id"]

    response = client.patch(
        f"/reviews/{review_id}", json={"rating": 5, "comment": "Updated"}, headers=setup["student_headers"]
    )
    assert response.status_code == 200
    assert response.json()["rating"] == 5


def test_student_cannot_update_others_review(client, setup, db_session):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    review_id = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 3},
        headers=setup["student_headers"],
    ).json()["id"]

    other_token = register_and_login(client, db_session, "eve@example.com")
    response = client.patch(
        f"/reviews/{review_id}",
        json={"rating": 1},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 403


def test_student_can_delete_own_review(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    review_id = client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 3},
        headers=setup["student_headers"],
    ).json()["id"]

    response = client.delete(f"/reviews/{review_id}", headers=setup["student_headers"])
    assert response.status_code == 204

    list_response = client.get(f"/courses/{setup['course_id']}/reviews")
    assert len(list_response.json()) == 0


def test_reviews_are_publicly_listable(client, setup):
    client.post(f"/courses/{setup['course_id']}/enroll", headers=setup["student_headers"])
    client.post(
        f"/courses/{setup['course_id']}/reviews",
        json={"rating": 5, "comment": "Excellent"},
        headers=setup["student_headers"],
    )

    response = client.get(f"/courses/{setup['course_id']}/reviews")
    assert response.status_code == 200
    assert len(response.json()) == 1
