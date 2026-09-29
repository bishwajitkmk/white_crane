"""Architecture section 9: honeypots, rate limits, single-use tokens, server-measured file sizes."""

from urllib.parse import urlsplit

from app.models import Application, Role, Subscriber
from tests.test_directory import APPLICATION


def test_application_honeypot_is_silently_dropped(client, db):
    res = client.post("/public/applications", json={**APPLICATION, "nickname": "bot"})
    assert res.status_code == 201
    assert res.json()["contact_email"] == APPLICATION["contact_email"]
    assert db.query(Application).count() == 0

    assert client.post("/public/applications", json=APPLICATION).status_code == 201
    assert db.query(Application).count() == 1


def test_subscribe_honeypot_is_silently_dropped(client, db):
    res = client.post("/public/subscribe", json={"email": "bot@spam-mail.org", "nickname": "x"})
    assert res.status_code == 202
    assert db.query(Subscriber).count() == 0


def test_public_forms_are_rate_limited(client):
    for _ in range(5):
        assert client.post("/public/applications", json=APPLICATION).status_code == 201
    res = client.post("/public/applications", json=APPLICATION)
    assert res.status_code == 429
    assert int(res.headers["Retry-After"]) > 0

    for i in range(10):
        assert client.post("/public/subscribe", json={"email": f"p{i}@example.org"}).status_code == 202
    assert client.post("/public/subscribe", json={"email": "p99@example.org"}).status_code == 429


def test_login_is_rate_limited(client, make_user):
    user = make_user(Role.board)
    for _ in range(10):
        assert client.post("/auth/login", json={"email": user.email, "password": "wrong-password"}).status_code == 401
    assert client.post("/auth/login", json={"email": user.email, "password": "wrong-password"}).status_code == 429


def test_resending_invite_expires_the_old_link(login, monkeypatch):
    client = login(Role.board)
    links = []
    monkeypatch.setattr("app.services.users.email.send", lambda template, to, **ctx: links.append(ctx["link"]))

    user = client.post("/admin/users/invite", json={"name": "T", "email": "t@wc.org", "role": "trainer"}).json()
    assert client.post(f"/admin/users/{user['id']}/resend-invite").status_code == 204
    old, new = (link.rsplit("/", 1)[-1] for link in links)

    assert client.get(f"/auth/invite/{old}").status_code == 404
    assert client.get(f"/auth/invite/{new}").status_code == 200


def test_only_newest_reset_link_works(client, make_user, monkeypatch):
    user = make_user(Role.board)
    links = []
    monkeypatch.setattr("app.routers.auth.routes.email.send", lambda template, to, **ctx: links.append(ctx["link"]))

    for _ in range(2):
        assert client.post("/auth/forgot", json={"email": user.email}).status_code == 204
    old, new = (link.rsplit("/", 1)[-1] for link in links)

    assert client.post("/auth/reset", json={"token": old, "password": "brand-new-password"}).status_code == 400
    assert client.post("/auth/reset", json={"token": new, "password": "brand-new-password"}).status_code == 204
    assert client.post("/auth/reset", json={"token": new, "password": "another-password"}).status_code == 400
    res = client.post("/auth/login", json={"email": user.email, "password": "brand-new-password"})
    assert res.status_code == 200


def test_uploaded_resource_size_is_measured(login):
    client = login(Role.board)
    presign = client.post("/admin/uploads/presign", json={"filename": "form.pdf", "content_type": "application/pdf"})
    upload_url, public_url = presign.json()["upload_url"], presign.json()["public_url"]
    parts = urlsplit(upload_url)
    assert client.put(f"{parts.path}?{parts.query}", content=b"x" * 1234).status_code == 204

    body = {"title": "Intake form", "category": "forms", "kind": "file", "url": public_url}
    resource = client.post("/admin/resources", json=body).json()
    assert resource["file_size_bytes"] == 1234

    link = client.patch(f"/admin/resources/{resource['id']}", json={**body, "kind": "link", "url": "https://x.org"})
    assert link.json()["file_size_bytes"] is None
