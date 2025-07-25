# ABOUTME: Unit tests for configuration management
# ABOUTME: Tests that app and test configurations load correctly

import pytest
from app.core.config import config
from app.core.test_config import test_config


class TestAppConfig:
    """Test application configuration"""
    
    def test_config_loads_successfully(self):
        """Test that config can be imported and has required fields"""
        assert config.name == "Foosball ELO Tracker"
        assert config.version == "1.0.0"
        assert config.environment in ["development", "staging", "production"]
        
    def test_database_url_format(self):
        """Test that database URL is properly formatted"""
        db_url = config.database_url
        assert db_url.startswith("postgresql://")
        assert "foosball" in db_url
        
    def test_trueskill_defaults(self):
        """Test TrueSkill configuration defaults"""
        assert config.trueskill_mu == 25.0
        assert config.trueskill_sigma == 8.333
        assert config.trueskill_beta == 4.167
        assert config.trueskill_tau == 0.083
        
    def test_cors_origins_list(self):
        """Test CORS origins configuration"""
        assert isinstance(config.cors_origins, list)
        assert len(config.cors_origins) > 0


class TestTestConfig:
    """Test test-specific configuration"""
    
    def test_test_config_overrides(self):
        """Test that test config properly overrides settings"""
        assert test_config.environment == "testing"
        assert test_config.db_name == "foosball_test"
        assert test_config.debug is True
        
    def test_test_database_url(self):
        """Test that test database URL uses test database"""
        db_url = test_config.database_url
        assert "foosball_test" in db_url
        assert db_url != config.database_url
        
    def test_inherits_from_app_config(self):
        """Test that test config inherits non-overridden values"""
        assert test_config.name == config.name
        assert test_config.version == config.version
        assert test_config.trueskill_mu == config.trueskill_mu