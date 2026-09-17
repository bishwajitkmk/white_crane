import csv
import io
from collections.abc import Iterable

from app.models import Subscriber


def subscribers_csv(subscribers: Iterable[Subscriber]) -> str:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["email", "subscribed_at", "source", "confirmed"])
    for s in subscribers:
        writer.writerow([s.email, s.subscribed_at.isoformat(), s.source, "yes" if s.confirmed else "no"])
    return buf.getvalue()
