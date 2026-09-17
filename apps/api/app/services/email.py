"""Transactional email. Templates live in app/emails/*.html (Jinja2). Newsletters are out of scope."""

import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

log = logging.getLogger(__name__)

_env = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "emails"),
    autoescape=select_autoescape(["html"]),
)

SUBJECTS = {
    "application_received": "We received your DBT Clinical Directory application",
    "application_decision": "Update on your DBT Clinical Directory application",
    "subscribe_confirm": "Confirm your White Crane subscription",
    "invite": "You are invited to the White Crane dashboard",
    "password_reset": "Reset your White Crane password",
}


def render(template: str, **context) -> str:
    return _env.get_template(f"{template}.html").render(frontend_url=settings.frontend_url, **context)


def send(template: str, to: str, **context) -> None:
    """Render and deliver. Call through FastAPI BackgroundTasks so requests never wait on the provider."""
    subject = SUBJECTS[template]
    html = render(template, subject=subject, **context)
    try:
        match settings.email_provider:
            case "resend":
                import resend

                resend.api_key = settings.resend_api_key
                resend.Emails.send({"from": settings.email_from, "to": [to], "subject": subject, "html": html})
            case "postmark":
                httpx.post(
                    "https://api.postmarkapp.com/email",
                    headers={"X-Postmark-Server-Token": settings.postmark_token, "Accept": "application/json"},
                    json={"From": settings.email_from, "To": to, "Subject": subject, "HtmlBody": html},
                    timeout=10,
                ).raise_for_status()
            case "mailpit":
                msg = EmailMessage()
                msg["From"], msg["To"], msg["Subject"] = settings.email_from, to, subject
                msg.set_content(html, subtype="html")
                with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
                    smtp.send_message(msg)
            case "console":
                log.info("email %s -> %s\n%s", template, to, html)
    except Exception:
        log.exception("Failed to send %s email to %s", template, to)
