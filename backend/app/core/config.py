# ABOUTME: Application configuration management using Pydantic Settings
# ABOUTME: Handles environment variables, database config, and app settings


from pydantic import Field
from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    host: str = Field(default="localhost", env="DB_HOST")
    port: int = Field(default=5432, env="DB_PORT")
    name: str = Field(default="foosball_dev", env="DB_NAME")
    user: str = Field(default="foosball_user", env="DB_USER")
    password: str = Field(default="dev_password", env="DB_PASSWORD")

    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @property
    def async_url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class AppConfig(BaseSettings):
    # App Settings
    name: str = Field(default="Foosball ELO Tracker", env="APP_NAME")
    version: str = Field(default="1.0.0", env="APP_VERSION")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")

    # API Settings
    api_prefix: str = Field(default="/api/v1", env="API_PREFIX")
    allowed_hosts: list[str] = Field(default=["*"], env="ALLOWED_HOSTS")
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"], env="CORS_ORIGINS"
    )

    # Security
    secret_key: str = Field(
        default="dev-secret-key-change-in-production", env="SECRET_KEY"
    )

    # Database settings (flattened)
    db_host: str = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    db_name: str = Field(default="foosball_dev", env="DB_NAME")
    db_user: str = Field(default="foosball_user", env="DB_USER")
    db_password: str = Field(default="dev_password", env="DB_PASSWORD")

    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")

    # External Services
    sentry_dsn: str | None = Field(default=None, env="SENTRY_DSN")

    # TrueSkill Settings
    trueskill_mu: float = Field(default=25.0, env="TRUESKILL_MU")
    trueskill_sigma: float = Field(default=8.333, env="TRUESKILL_SIGMA")
    trueskill_beta: float = Field(default=4.167, env="TRUESKILL_BETA")
    trueskill_tau: float = Field(default=0.083, env="TRUESKILL_TAU")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def database_url(self) -> str:
        """Get database URL"""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def database_async_url(self) -> str:
        """Get async database URL"""
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"


# Global config instance
config = AppConfig()
