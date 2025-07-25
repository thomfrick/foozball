# ABOUTME: Test-specific configuration overrides
# ABOUTME: Provides isolated test database and modified settings for testing

from app.core.config import AppConfig


class TestConfig(AppConfig):
    """Test configuration with overrides for testing environment"""

    # Override database settings for test database
    db_name: str = "foosball_test"

    # Test-specific settings
    environment: str = "testing"
    debug: bool = True
    log_level: str = "DEBUG"

    # Fast settings for testing
    trueskill_mu: float = 25.0
    trueskill_sigma: float = 8.333

    class Config:
        env_file = ".env.test"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Test config instance
test_config = TestConfig()
