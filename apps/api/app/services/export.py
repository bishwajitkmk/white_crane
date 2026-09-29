import csv
import io
from collections.abc import Iterable

from app.models import Subscriber, TrainingRegistration


def subscribers_csv(subscribers: Iterable[Subscriber]) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["email", "subscribed_at", "source", "confirmed"])
    for s in subscribers:
        writer.writerow([s.email, s.subscribed_at.isoformat(), s.source, "yes" if s.confirmed else "no"])
    return buf.getvalue()


def registrations_csv(registrations: Iterable[TrainingRegistration]) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["full_name", "email", "phone", "organization", "role", "notes", "registered_at"])
    for r in registrations:
        writer.writerow([r.full_name, r.email, r.phone, r.organization, r.role, r.notes, r.registered_at.isoformat()])
    return buf.getvalue()
