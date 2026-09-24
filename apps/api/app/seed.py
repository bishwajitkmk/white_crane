"""Bootstrap the first Board account (there is no public sign-up).

    uv run python -m app.seed --email ronda@whitecrane.org --name "Ronda Oswalt Reitz"

Prints an invite link; open it to set the password. For local development you can skip the invite:

    uv run python -m app.seed --email admin@whitecrane.org --name "Admin" --password "a-long-password"
"""

import argparse

from fastapi import BackgroundTasks
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Role, User, UserStatus
from app.services.users import send_invite


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--role", default=Role.board.value, choices=[r.value for r in Role])
    parser.add_argument("--password", help="create an active account with this password instead of an invite")
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
        if args.password:
            if len(args.password) < 10:
                parser.error("--password must be at least 10 characters")
            user.password_hash = hash_password(args.password)
            user.status = UserStatus.active
            db.commit()
            print(f"Active {user.role.value} account ready: {email}. Sign in at {settings.frontend_url}/login")
            return
        raw = send_invite(db, user, None, BackgroundTasks())  # not sending email from the CLI
        print(f"Invite link: {settings.frontend_url}/invite/{raw}")


if __name__ == "__main__":
    main()
