import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["EMAIL_PROVIDER"] = "console"
os.environ["JWT_SECRET"] = "test-secret-that-is-at-least-32-bytes-long"

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.deps import get_db  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Role, User, UserStatus  # noqa: E402

PASSWORD = "correct-horse-battery"


@pytest.fixture
def db() -> Iterator[Session]:
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with TestSession() as session:
        app.dependency_overrides[get_db] = lambda: session
        yield session
    app.dependency_overrides.clear()


@pytest.fixture
def client(db: Session) -> TestClient:
    return TestClient(app)


@pytest.fixture
def make_user(db: Session):
    def make(role: Role, email: str | None = None) -> User:
        user = User(
            email=email or f"{role.value}@whitecrane.org",
            name=f"{role.value.title()} User",
            role=role,
            status=UserStatus.active,
            password_hash=hash_password(PASSWORD),
        )
        db.add(user)
        db.commit()
        return user

    return make


@pytest.fixture
def login(client: TestClient, make_user):
    def as_role(role: Role) -> TestClient:
        user = make_user(role)
        res = client.post("/auth/login", json={"email": user.email, "password": PASSWORD})
        assert res.status_code == 200, res.text
        return client

    return as_role
