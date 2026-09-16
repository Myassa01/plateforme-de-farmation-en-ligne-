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

    instructor_headers = {"Authorization": f"Bearer {instructor_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
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

    section_id = client.post(
        f"/courses/{course_id}/sections", json={"title": "Section 1"}, headers=instructor_headers
    ).json()["id"]

    lesson_id = client.post(
        f"/sections/{section_id}/lessons", json={"title": "Lesson 1"}, headers=instructor_headers
    ).json()["id"]

    client.post(f"/courses/{course_id}/submit", headers=instructor_headers)
    client.post(f"/courses/{course_id}/approve", headers=admin_headers)
    client.post(f"/courses/{course_id}/enroll", headers=student_headers)

    return {
        "instructor_headers": instructor_headers,
        "admin_headers": admin_headers,
        "student_headers": student_headers,
        "course_id": course_id,
        "lesson_id": lesson_id,
    }


def _create_quiz_with_question(client, setup):
    quiz_id = client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 1", "passing_score": 50},
        headers=setup["instructor_headers"],
    ).json()["id"]

    question_response = client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "text": "What is 2+2?",
            "type": "multiple_choice",
            "answers": [
                {"text": "3", "is_correct": False},
                {"text": "4", "is_correct": True},
                {"text": "5", "is_correct": False},
            ],
        },
        headers=setup["instructor_headers"],
    ).json()

    correct_answer_id = next(a["id"] for a in question_response["answers"] if a["is_correct"])
    wrong_answer_id = next(a["id"] for a in question_response["answers"] if not a["is_correct"])

    return quiz_id, question_response["id"], correct_answer_id, wrong_answer_id


def test_instructor_can_create_quiz_with_question(client, setup):
    quiz_id, question_id, correct_id, wrong_id = _create_quiz_with_question(client, setup)
    assert quiz_id is not None
    assert question_id is not None


def test_question_requires_exactly_one_correct_answer(client, setup):
    quiz_id = client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 1"},
        headers=setup["instructor_headers"],
    ).json()["id"]

    response = client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "text": "Bad question",
            "type": "multiple_choice",
            "answers": [
                {"text": "A", "is_correct": True},
                {"text": "B", "is_correct": True},
            ],
        },
        headers=setup["instructor_headers"],
    )
    assert response.status_code == 409


def test_lesson_can_only_have_one_quiz(client, setup):
    client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 1"},
        headers=setup["instructor_headers"],
    )
    response = client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 2"},
        headers=setup["instructor_headers"],
    )
    assert response.status_code == 409


def test_student_cannot_create_quiz(client, setup):
    response = client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 1"},
        headers=setup["student_headers"],
    )
    assert response.status_code == 403


def test_student_quiz_view_hides_correct_answer(client, setup):
    quiz_id, _, _, _ = _create_quiz_with_question(client, setup)

    response = client.get(f"/quizzes/{quiz_id}", headers=setup["student_headers"])
    assert response.status_code == 200
    answer = response.json()["questions"][0]["answers"][0]
    assert "is_correct" not in answer


def test_non_enrolled_student_cannot_access_quiz(client, setup, db_session):
    quiz_id, _, _, _ = _create_quiz_with_question(client, setup)

    other_token = register_and_login(client, db_session, "other@example.com")
    response = client.get(f"/quizzes/{quiz_id}", headers={"Authorization": f"Bearer {other_token}"})
    assert response.status_code == 403


def test_submit_quiz_with_correct_answer_passes(client, setup):
    quiz_id, question_id, correct_id, _ = _create_quiz_with_question(client, setup)

    response = client.post(
        f"/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": question_id, "selected_answer_id": correct_id}]},
        headers=setup["student_headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 100
    assert data["passed"] is True
    assert data["attempt_answers"][0]["is_correct"] is True


def test_submit_quiz_with_wrong_answer_fails(client, setup):
    quiz_id, question_id, _, wrong_id = _create_quiz_with_question(client, setup)

    response = client.post(
        f"/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": question_id, "selected_answer_id": wrong_id}]},
        headers=setup["student_headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 0
    assert data["passed"] is False


def test_cannot_submit_incomplete_answers(client, setup):
    quiz_id = client.post(
        f"/lessons/{setup['lesson_id']}/quizzes",
        json={"title": "Quiz 1"},
        headers=setup["instructor_headers"],
    ).json()["id"]

    client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "text": "Q1",
            "type": "true_false",
            "answers": [
                {"text": "True", "is_correct": True},
                {"text": "False", "is_correct": False},
            ],
        },
        headers=setup["instructor_headers"],
    )
    client.post(
        f"/quizzes/{quiz_id}/questions",
        json={
            "text": "Q2",
            "type": "true_false",
            "answers": [
                {"text": "True", "is_correct": True},
                {"text": "False", "is_correct": False},
            ],
        },
        headers=setup["instructor_headers"],
    )

    response = client.post(
        f"/quizzes/{quiz_id}/submit", json={"answers": []}, headers=setup["student_headers"]
    )
    assert response.status_code == 409


def test_can_review_past_attempt(client, setup):
    quiz_id, question_id, correct_id, _ = _create_quiz_with_question(client, setup)

    submit_response = client.post(
        f"/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": question_id, "selected_answer_id": correct_id}]},
        headers=setup["student_headers"],
    )
    attempt_id = submit_response.json()["id"]

    review_response = client.get(
        f"/quizzes/{quiz_id}/attempts/{attempt_id}", headers=setup["student_headers"]
    )
    assert review_response.status_code == 200
    assert review_response.json()["score"] == 100


def test_other_student_cannot_view_attempt(client, setup, db_session):
    quiz_id, question_id, correct_id, _ = _create_quiz_with_question(client, setup)
    submit_response = client.post(
        f"/quizzes/{quiz_id}/submit",
        json={"answers": [{"question_id": question_id, "selected_answer_id": correct_id}]},
        headers=setup["student_headers"],
    )
    attempt_id = submit_response.json()["id"]

    other_token = register_and_login(client, db_session, "eve@example.com")
    response = client.get(
        f"/quizzes/{quiz_id}/attempts/{attempt_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert response.status_code == 403
