from urllib.parse import urlsplit

from app.models import Role


def _path(url: str) -> str:
    parts = urlsplit(url)
    return parts.path + (f"?{parts.query}" if parts.query else "")


def test_local_upload_roundtrip(login):
    client = login(Role.board)
    res = client.post(
        "/admin/uploads/presign", json={"filename": "Team checklist.pdf", "content_type": "application/pdf"}
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["public_url"].endswith("/Team-checklist.pdf")

    put = client.put(_path(body["upload_url"]), content=b"%PDF-1.4 demo", headers={"Content-Type": "application/pdf"})
    assert put.status_code == 204, put.text

    got = client.get(_path(body["public_url"]))
    assert got.status_code == 200
    assert got.content == b"%PDF-1.4 demo"


def test_upload_rejects_tampered_or_foreign_key(login):
    client = login(Role.board)
    body = client.post("/admin/uploads/presign", json={"filename": "a.png", "content_type": "image/png"}).json()
    token = body["upload_url"].split("token=")[1]
    assert client.put(f"/uploads/uploads/other/evil.png?token={token}", content=b"x").status_code == 403
    assert client.put(f"/uploads/uploads/x/a.png?token={token}x", content=b"x").status_code == 403


def test_presign_blocks_scriptable_types_and_needs_login(client, login):
    assert client.post("/admin/uploads/presign", json={"filename": "a.png"}).status_code == 401
    board = login(Role.board)
    for name in ("page.html", "logo.svg", "run.js", "noext"):
        assert board.post("/admin/uploads/presign", json={"filename": name}).status_code == 422, name


def test_trainer_can_upload_cover_images(login):
    client = login(Role.trainer)
    res = client.post("/admin/uploads/presign", json={"filename": "cover.jpg", "content_type": "image/jpeg"})
    assert res.status_code == 200, res.text
