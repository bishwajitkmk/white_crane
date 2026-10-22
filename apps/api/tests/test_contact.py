from app.core.config import settings
from app.services import email

MESSAGE = {
    "name": " Dana Lee ",
    "email": "dana@riverbend.org",
    "organization": "Riverbend DBT Team",
    "topic": "consultation",
    "message": "We'd like consultation for our adolescent team.",
}


def test_contact_emails_the_board_with_reply_to_visitor(client, monkeypatch):
    sent = []
    monkeypatch.setattr(
        "app.routers.public.contact.email.send", lambda template, to, **ctx: sent.append((template, to, ctx))
    )

    res = client.post("/public/contact", json=MESSAGE)
    assert res.status_code == 202

    [(template, to, ctx)] = sent
    assert (template, to) == ("contact_message", settings.contact_email)
    assert ctx["reply_to"] == "dana@riverbend.org"
    assert ctx["subject"] == "Website message: Consultation for teams from Dana Lee"
    assert ctx["name"] == "Dana Lee"


def test_contact_email_renders_and_escapes_the_message():
    html = email.render(
        "contact_message",
        name="Dana",
        email="dana@riverbend.org",
        organization="",
        topic="Training",
        message="<b>hi</b>",
    )
    assert "&lt;b&gt;hi&lt;/b&gt;" in html
    assert "Organization" not in html


def test_contact_honeypot_is_silently_dropped(client, monkeypatch):
    sent = []
    monkeypatch.setattr("app.routers.public.contact.email.send", lambda *a, **k: sent.append(a))
    assert client.post("/public/contact", json={**MESSAGE, "nickname": "bot"}).status_code == 202
    assert sent == []


def test_contact_requires_a_message(client):
    assert client.post("/public/contact", json={**MESSAGE, "message": "   "}).status_code == 422
    assert client.post("/public/contact", json={**MESSAGE, "topic": "sales"}).status_code == 422
