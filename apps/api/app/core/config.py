from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://wc:wc@localhost:5432/whitecrane"

    jwt_secret: str = "change-me"
    access_token_minutes: int = 15
    refresh_token_days: int = 14
    cookie_secure: bool = False
    # "none" (with cookie_secure=true) only if the site and API are on different registrable domains,
    # e.g. *.vercel.app + *.up.railway.app. Keep "lax" for whitecrane.org + api.whitecrane.org.
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    # e.g. ".whitecranetraining.org" to share auth cookies across the site and api subdomains. Empty = host-only.
    cookie_domain: str | None = None
    frontend_url: str = "http://localhost:5173"
    # Extra CORS origins besides frontend_url, comma separated (e.g. preview deploys, vite preview on :4173).
    cors_origins: str = ""
    api_url: str = "http://localhost:8000"

    email_provider: Literal["resend", "postmark", "mailpit", "console"] = "mailpit"
    email_from: str = "info@whitecrane.org"
    resend_api_key: str = ""
    postmark_token: str = ""
    smtp_host: str = "localhost"
    smtp_port: int = 1025

    s3_endpoint: str = ""
    s3_bucket: str = "whitecrane"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_public_url: str = ""
    # Used when S3_ENDPOINT is empty: uploads go to this folder and are served by the API at /files/.
    local_upload_dir: str = "uploads"
    max_upload_mb: int = 25

    listing_term_days: int = 365
    invite_expiry_days: int = 7
    password_reset_minutes: int = 60

    # Per-IP limits on public forms and login (app.core.rate_limit).
    rate_limit_enabled: bool = True

    @field_validator("database_url")
    @classmethod
    def _use_psycopg3(cls, v: str) -> str:
        # Neon/Render hand out postgres:// or postgresql:// URLs, which SQLAlchemy maps to psycopg2 (not installed).
        for prefix in ("postgres://", "postgresql://"):
            if v.startswith(prefix):
                return "postgresql+psycopg://" + v[len(prefix) :]
        return v

    @field_validator("cookie_domain")
    @classmethod
    def _empty_domain_is_none(cls, v: str | None) -> str | None:
        return v.strip() or None if v else None

    @property
    def allowed_origins(self) -> list[str]:
        extra = [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]
        return [self.frontend_url.rstrip("/"), *extra]

    @property
    def use_local_storage(self) -> bool:
        return not self.s3_endpoint


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
