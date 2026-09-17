"""Bootstrap the first Board account (there is no public sign-up).

    uv run python -m app.seed --email ronda@whitecrane.org --name "Ronda Oswalt Reitz"

Prints an invite link; open it to set the password.
"""

import argparse

from fastapi import BackgroundTasks
from sqlalchemy import select

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import Role, User, UserStatus
from app.services.users import send_invite


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--role", default=Role.board.value, choices=[r.value for r in Role])
    args = parser.parse_args()

    with SessionLocal() as db:
        email = args.email.lower()
        user = db.scalar(select(User).where(User.email == email))
        if user and user.status == UserStatus.active:
            print(f"{email} already has an active account.")
            return
        if not user:
            user = User(email=email, name=args.name, role=Role(args.role), status=UserStatus.invited)
            db.add(user)
            db.flush()
        raw = send_invite(db, user, None, BackgroundTasks())  # not sending email from the CLI
        print(f"Invite link: {settings.frontend_url}/invite/{raw}")


if __name__ == "__main__":
    main()
