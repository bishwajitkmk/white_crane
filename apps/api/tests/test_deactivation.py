from fastapi.testclient import TestClient

from app.main import app
from app.models import Role
from tests.conftest import PASSWORD


def _board_and_trainer(login, make_user):
    board = login(Role.board)
    trainer = make_user(Role.trainer)
    trainer_client = TestClient(app)
    assert trainer_client.post("/auth/login", json={"email": trainer.email, "password": PASSWORD}).status_code == 200
    return board, trainer, trainer_client


def test_deactivation_revokes_open_sessions_and_login(login, make_user):
    board, trainer, trainer_client = _board_and_trainer(login, make_user)
    assert trainer_client.get("/admin/trainings").status_code == 200

    res = board.post(f"/admin/users/{trainer.id}/deactivate")
    assert res.status_code == 200 and res.json()["status"] == "deactivated"

    assert trainer_client.get("/admin/trainings").status_code == 401  # existing session
    assert trainer_client.post("/auth/refresh").status_code == 401
    res = trainer_client.post("/auth/login", json={"email": trainer.email, "password": PASSWORD})
    assert res.status_code == 401


def test_reactivation_restores_access_with_old_password(login, make_user):
    board, trainer, trainer_client = _board_and_trainer(login, make_user)
    board.post(f"/admin/users/{trainer.id}/deactivate")

    res = board.post(f"/admin/users/{trainer.id}/reactivate")
    assert res.status_code == 200 and res.json()["status"] == "active"
    assert trainer_client.post("/auth/login", json={"email": trainer.email, "password": PASSWORD}).status_code == 200


def test_cannot_deactivate_yourself(login, db):
    board = login(Role.board)
    me = board.get("/auth/me").json()
    assert board.post(f"/admin/users/{me['id']}/deactivate").status_code == 409


def test_only_board_can_deactivate(login, make_user):
    other = make_user(Role.trainer, email="other@whitecrane.org")
    directorate = login(Role.directorate)
    assert directorate.post(f"/admin/users/{other.id}/deactivate").status_code == 403


def test_deactivating_invited_user_kills_invite_and_reactivating_sends_new_one(login, monkeypatch):
    board = login(Role.board)
    links = []
    monkeypatch.setattr("app.services.users.email.send", lambda template, to, **ctx: links.append(ctx["link"]))

    user = board.post("/admin/users/invite", json={"name": "R", "email": "r@agency.org", "role": "directorate"}).json()
    board.post(f"/admin/users/{user['id']}/deactivate")
    first = links[-1].rsplit("/", 1)[-1]
    assert board.get(f"/auth/invite/{first}").status_code == 404
    assert board.post(f"/admin/users/{user['id']}/resend-invite").status_code == 409

    res = board.post(f"/admin/users/{user['id']}/reactivate")
    assert res.json()["status"] == "invited"
    second = links[-1].rsplit("/", 1)[-1]
    assert second != first
    assert board.get(f"/auth/invite/{second}").status_code == 200


def test_deactivated_user_cannot_request_password_reset(login, make_user, monkeypatch):
    board, trainer, _ = _board_and_trainer(login, make_user)
    sent = []
    monkeypatch.setattr("app.routers.auth.routes.email.send", lambda template, to, **ctx: sent.append(ctx["link"]))

    board.post("/auth/forgot", json={"email": trainer.email})
    token = sent[-1].rsplit("/", 1)[-1]
    board.post(f"/admin/users/{trainer.id}/deactivate")

    assert board.post("/auth/reset", json={"token": token, "password": "brand-new-password"}).status_code == 400
    assert board.post("/auth/forgot", json={"email": trainer.email}).status_code == 204
    assert len(sent) == 1  # no new link for a deactivated account
