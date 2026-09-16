from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    environment: str = "development"
    cors_origins: str = "http://localhost:5173"

    storage_dir: str = "./storage"
    max_upload_size_mb: int = 200

    smtp_host: str = ""
    smtp_port: int = 2525
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "no-reply@learnhub.dev"
    frontend_base_url: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
