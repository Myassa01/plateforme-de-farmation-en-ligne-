import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.user import User, UserRole

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def register_and_login(client, db_session, email: str, role: UserRole = UserRole.STUDENT) -> str:
    client.post(
        "/auth/register",
        json={"email": email, "full_name": "Test User", "password": "SecurePass123"},
    )
    if role != UserRole.STUDENT:
        user = db_session.query(User).filter(User.email == email).first()
        user.role = role
        db_session.commit()

    login = client.post("/auth/login", json={"email": email, "password": "SecurePass123"})
    return login.json()["access_token"]
