from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./cloud_ump.db"
    SECRET_KEY: str = "dev-secret-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    # Hugging Face — optional, free tier works without token (just rate-limited)
    HF_TOKEN: str = ""
    APP_NAME: str = "Cloud UMP"
    DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
