from app.models import Role
from tests.conftest import PASSWORD


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_login_sets_cookie_and_me(client, make_user):
    user = make_user(Role.board)
    assert client.get("/auth/me").status_code == 401

    res = client.post("/auth/login", json={"email": user.email, "password": PASSWORD})
    assert res.status_code == 200
    assert "wc_access" in res.cookies

    me = client.get("/auth/me").json()
    assert me["email"] == user.email and me["role"] == "board"


def test_wrong_password(client, make_user):
    user = make_user(Role.board)
    res = client.post("/auth/login", json={"email": user.email, "password": "nope-nope-nope"})
    assert res.status_code == 401


def test_trainer_sees_trainings_only(login):
    client = login(Role.trainer)
    assert client.get("/admin/trainings").status_code == 200
    assert client.get("/admin/applications").status_code == 403
    assert client.get("/admin/subscribers").status_code == 403
    assert client.get("/admin/users").status_code == 403


def test_directorate_sees_directory_only(login):
    client = login(Role.directorate)
    assert client.get("/admin/applications").status_code == 200
    assert client.get("/admin/listings").status_code == 200
    assert client.get("/admin/trainings").status_code == 403
    assert client.get("/admin/content").status_code == 403


def test_board_sees_everything(login):
    client = login(Role.board)
    for path in ("/admin/summary", "/admin/content", "/admin/trainings", "/admin/applications", "/admin/users"):
        assert client.get(path).status_code == 200, path


def test_invite_flow(login, monkeypatch):
    client = login(Role.board)
    sent = {}
    monkeypatch.setattr("app.services.users.email.send", lambda template, to, **ctx: sent.update(ctx))

    res = client.post("/admin/users/invite", json={"name": "Reviewer", "email": "r1@agency.org", "role": "directorate"})
    assert res.status_code == 201
    token = sent["link"].rsplit("/", 1)[-1]

    client.post("/auth/logout")
    info = client.get(f"/auth/invite/{token}").json()
    assert info["email"] == "r1@agency.org" and info["role"] == "directorate"

    body = {"token": token, "name": "Reviewer One", "password": "long-enough-pw"}
    res = client.post("/auth/accept-invite", json=body)
    assert res.status_code == 200
    assert client.get("/auth/me").json()["status"] == "active"
    assert client.get(f"/auth/invite/{token}").status_code == 404
