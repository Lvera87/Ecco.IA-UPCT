"""Application settings and configuration helpers."""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    app_name: str = "FastAPI Boilerplate"
    project_version: str = "0.1.0"
    environment: str = "development"
    # Optional log level used by app.core.logging.setup_logging
    log_level: str | None = None

    api_v1_prefix: str = "/api/v1"
    # Origins allowed to interact with the API (React dev server by default)
    backend_cors_origins: List[str] | str = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]

    database_url: str = "sqlite+aiosqlite:///./sql_app.db"
    # JWT / Auth settings
    secret_key: str = "CHANGE_ME_TO_A_RANDOM_SECRET"
    access_token_expire_minutes: int = 60 * 24 * 7  # one week by default
    
    # Development mode - ONLY for local development, bypasses auth
    dev_mode: bool = True  # Set to False in production

    # Gemini settings
    gemini_api_key: str | None = None
    gemini_model_name: str = "gemini-2.5-flash-lite" # Requested by user

    # Support running from root or backend folder
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: List[str] | str) -> List[str]:
        """Ensure CORS origins can be provided as a comma separated string."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin]
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
