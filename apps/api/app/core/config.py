from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://wc:wc@localhost:5432/whitecrane"

    jwt_secret: str = "change-me"
    access_token_minutes: int = 15
    refresh_token_days: int = 14
    cookie_secure: bool = False
    frontend_url: str = "http://localhost:5173"
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

    listing_term_days: int = 365
    invite_expiry_days: int = 7
    password_reset_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
