# Foosball ELO Tracker - Configuration Management

## Configuration Strategy

We'll use environment-based configuration with clear separation between development, staging, and production environments. All sensitive data will be handled through environment variables and secrets management.

## Backend Configuration (FastAPI)

### Configuration Structure
```python
# app/config.py
from pydantic import BaseSettings, Field
from typing import Optional, List
import os

class DatabaseConfig(BaseSettings):
    host: str = Field(..., env="DB_HOST")
    port: int = Field(5432, env="DB_PORT") 
    name: str = Field(..., env="DB_NAME")
    user: str = Field(..., env="DB_USER")
    password: str = Field(..., env="DB_PASSWORD")
    
    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

class RedisConfig(BaseSettings):
    host: str = Field("localhost", env="REDIS_HOST")
    port: int = Field(6379, env="REDIS_PORT")
    password: Optional[str] = Field(None, env="REDIS_PASSWORD")
    db: int = Field(0, env="REDIS_DB")

class AuthConfig(BaseSettings):
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

class AppConfig(BaseSettings):
    # App Settings
    name: str = Field("Foosball ELO Tracker", env="APP_NAME")
    version: str = Field("1.0.0", env="APP_VERSION")
    environment: str = Field("development", env="ENVIRONMENT")
    debug: bool = Field(False, env="DEBUG")
    
    # API Settings
    api_prefix: str = Field("/api/v1", env="API_PREFIX")
    allowed_hosts: List[str] = Field(["*"], env="ALLOWED_HOSTS")
    cors_origins: List[str] = Field(["http://localhost:3000"], env="CORS_ORIGINS")
    
    # Security
    secret_key: str = Field(..., env="SECRET_KEY")
    
    # Database
    database: DatabaseConfig = DatabaseConfig()
    
    # Redis (optional, for caching)
    redis: Optional[RedisConfig] = None
    
    # Auth
    auth: AuthConfig = AuthConfig()
    
    # Logging
    log_level: str = Field("INFO", env="LOG_LEVEL")
    log_format: str = Field("json", env="LOG_FORMAT")  # json or text
    
    # External Services
    sentry_dsn: Optional[str] = Field(None, env="SENTRY_DSN")
    
    # TrueSkill Settings
    trueskill_mu: float = Field(25.0, env="TRUESKILL_MU")
    trueskill_sigma: float = Field(8.333, env="TRUESKILL_SIGMA")
    trueskill_beta: float = Field(4.167, env="TRUESKILL_BETA")
    trueskill_tau: float = Field(0.083, env="TRUESKILL_TAU")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Global config instance
config = AppConfig()
```

### Environment Files

#### `.env.example` (Template)
```bash
# App Configuration
APP_NAME=Foosball ELO Tracker
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your-secret-key-here-generate-with-openssl-rand-hex-32

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foosball_dev
DB_USER=foosball_user
DB_PASSWORD=your-db-password

# API Settings
API_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Logging
LOG_LEVEL=DEBUG
LOG_FORMAT=text

# Optional: Redis (for caching)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0

# Optional: External Services
# SENTRY_DSN=https://your-sentry-dsn

# TrueSkill Configuration
TRUESKILL_MU=25.0
TRUESKILL_SIGMA=8.333
TRUESKILL_BETA=4.167
TRUESKILL_TAU=0.083
```

#### `.env.development`
```bash
ENVIRONMENT=development
DEBUG=true
DB_NAME=foosball_dev
LOG_LEVEL=DEBUG
LOG_FORMAT=text
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

#### `.env.staging`
```bash
ENVIRONMENT=staging
DEBUG=false
DB_NAME=foosball_staging
LOG_LEVEL=INFO
LOG_FORMAT=json
CORS_ORIGINS=["https://staging.foosball.company.com"]
SENTRY_DSN=https://your-staging-sentry-dsn
```

#### `.env.production`
```bash
ENVIRONMENT=production
DEBUG=false
DB_NAME=foosball_prod
LOG_LEVEL=WARNING
LOG_FORMAT=json
CORS_ORIGINS=["https://foosball.company.com"]
SENTRY_DSN=https://your-production-sentry-dsn
```

## Frontend Configuration (React)

### Configuration Structure
```typescript
// src/config/index.ts
interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    enableTournaments: boolean;
    enableTeamGames: boolean;
    enableDarkMode: boolean;
  };
  sentry: {
    dsn?: string;
    environment: string;
  };
}

const config: AppConfig = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Foosball ELO Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  features: {
    enableTournaments: import.meta.env.VITE_ENABLE_TOURNAMENTS === 'true',
    enableTeamGames: import.meta.env.VITE_ENABLE_TEAM_GAMES === 'true',
    enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  },
};

export default config;
```

### Frontend Environment Files

#### `.env.example`
```bash
# App Configuration
VITE_APP_NAME=Foosball ELO Tracker
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_TOURNAMENTS=false
VITE_ENABLE_TEAM_GAMES=true
VITE_ENABLE_DARK_MODE=true

# External Services
# VITE_SENTRY_DSN=https://your-sentry-dsn
```

#### `.env.development`
```bash
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_TOURNAMENTS=false
VITE_ENABLE_TEAM_GAMES=true
```

#### `.env.staging`
```bash
VITE_ENVIRONMENT=staging
VITE_API_BASE_URL=https://api-staging.foosball.company.com/api/v1
VITE_ENABLE_TOURNAMENTS=true
VITE_ENABLE_TEAM_GAMES=true
VITE_SENTRY_DSN=https://your-staging-sentry-dsn
```

#### `.env.production`
```bash
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.foosball.company.com/api/v1
VITE_ENABLE_TOURNAMENTS=true
VITE_ENABLE_TEAM_GAMES=true
VITE_SENTRY_DSN=https://your-production-sentry-dsn
```

## Docker Configuration

### Backend Dockerfile
```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

# Install uv
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set default command
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration

#### `docker-compose.yml` (Development)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: foosball_dev
      POSTGRES_USER: foosball_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DB_HOST=db
      - DB_NAME=foosball_dev
      - DB_USER=foosball_user
      - DB_PASSWORD=dev_password
      - ENVIRONMENT=development
      - DEBUG=true
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - db
    command: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1
      - VITE_ENVIRONMENT=development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

#### `docker-compose.prod.yml` (Production)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DB_HOST=db
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - DEBUG=false
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
```

## Secrets Management

### Development
- Use `.env` files (excluded from git)
- Local environment variables
- Docker secrets for sensitive data

### Staging/Production
- Use cloud provider secrets (AWS Secrets Manager, etc.)
- Kubernetes secrets
- HashiCorp Vault integration
- Never store secrets in code or config files

### Secret Rotation Strategy
```python
# app/utils/secrets.py
import os
from typing import Optional
import boto3  # For AWS Secrets Manager

class SecretsManager:
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        
    def get_secret(self, secret_name: str) -> Optional[str]:
        if self.environment == "development":
            return os.getenv(secret_name)
        else:
            # Use cloud secrets manager
            return self._get_from_aws_secrets(secret_name)
    
    def _get_from_aws_secrets(self, secret_name: str) -> Optional[str]:
        # Implementation for AWS Secrets Manager
        pass
```

## Configuration Validation

### Backend Validation
```python
# app/config.py (continued)
from pydantic import validator

class AppConfig(BaseSettings):
    # ... other fields ...
    
    @validator('secret_key')
    def secret_key_length(cls, v):
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        return v
    
    @validator('environment')
    def valid_environment(cls, v):
        if v not in ['development', 'staging', 'production']:
            raise ValueError('ENVIRONMENT must be development, staging, or production')
        return v
    
    @validator('cors_origins')
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
```

### Configuration Testing
```python
# tests/test_config.py
import pytest
from app.config import AppConfig

def test_config_validation():
    # Test valid config
    config = AppConfig(
        secret_key='a' * 32,
        db_host='localhost',
        db_name='test_db',
        db_user='test_user',
        db_password='test_pass'
    )
    assert config.secret_key == 'a' * 32
    
def test_invalid_secret_key():
    # Test invalid secret key
    with pytest.raises(ValueError):
        AppConfig(
            secret_key='short',
            db_host='localhost',
            db_name='test_db',
            db_user='test_user',
            db_password='test_pass'
        )
```

## Feature Flags

### Backend Feature Flags
```python
# app/config.py (continued)
class FeatureFlags(BaseSettings):
    enable_tournaments: bool = Field(False, env="ENABLE_TOURNAMENTS")
    enable_team_games: bool = Field(True, env="ENABLE_TEAM_GAMES")
    enable_statistics: bool = Field(True, env="ENABLE_STATISTICS")
    enable_user_registration: bool = Field(False, env="ENABLE_USER_REGISTRATION")
    
    class Config:
        env_prefix = "FEATURE_"
```

### Frontend Feature Flags
```typescript
// src/hooks/useFeatureFlags.ts
import config from '../config';

export const useFeatureFlags = () => {
  return {
    tournaments: config.features.enableTournaments,
    teamGames: config.features.enableTeamGames,
    darkMode: config.features.enableDarkMode,
  };
};
```

## Phase 0 Integration

Add these configuration tasks to Phase 0:

### 0.1 Backend Foundation
- [ ] 0.1.12 Set up configuration management with Pydantic
- [ ] 0.1.13 Create environment-specific config files
- [ ] 0.1.14 Set up secrets management strategy

### 0.2 Frontend Foundation
- [ ] 0.2.10 Set up frontend configuration management
- [ ] 0.2.11 Create environment-specific frontend configs
- [ ] 0.2.12 Set up feature flag system

### 0.3 Integration Testing
- [ ] 0.3.9 Test configuration loading in all environments
- [ ] 0.3.10 Validate secrets management system
- [ ] 0.3.11 Test feature flags functionality