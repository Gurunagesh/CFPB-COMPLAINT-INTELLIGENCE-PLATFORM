import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv(
        "APP_NAME",
        "CFPB Complaint Intelligence API"
    )

    app_version: str = os.getenv(
        "APP_VERSION",
        "1.0.0"
    )

    environment: str = os.getenv(
        "ENVIRONMENT",
        "development"
    )

    log_level: str = os.getenv(
        "LOG_LEVEL",
        "INFO"
    )

    allowed_origins: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    )

    request_timeout_seconds: int = int(
        os.getenv(
            "REQUEST_TIMEOUT_SECONDS",
            "30"
        )
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


settings = Settings()