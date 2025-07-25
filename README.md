# Foosball ELO Tracker

A modern web application for tracking foosball games and managing player ratings using ELO and TrueSkill rating systems.

## Project Status

### Phase 0.1 - Backend Foundation ✅ COMPLETED

We have successfully completed the backend foundation setup:

- ✅ Python project with uv package management
- ✅ FastAPI application structure
- ✅ PostgreSQL database with Docker
- ✅ SQLAlchemy ORM with Alembic migrations
- ✅ Configuration management with Pydantic Settings
- ✅ Health check endpoints with database connectivity

## Architecture Overview

```
FastAPI Backend (Python 3.11+)
├── PostgreSQL Database (Docker)
├── SQLAlchemy ORM + Alembic Migrations
├── Pydantic Settings Configuration
└── Health Check Endpoints
```

## Quick Start

### Prerequisites

- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Docker](https://www.docker.com/) - For PostgreSQL database
- Python 3.11+

### 1. Start the Database

```bash
# Start PostgreSQL container
docker-compose up db -d

# Verify database is healthy
docker-compose ps
```

### 2. Install Dependencies

```bash
# Install backend dependencies
uv sync --dev --project backend

# Install backend package in editable mode
uv pip install -e backend
```

### 3. Run Database Migrations

```bash
# Create and run migrations
uv run --directory backend alembic upgrade head
```

### 4. Start the API Server

```bash
# Start FastAPI development server
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Test the API

Open your browser or use curl to test the endpoints:

```bash
# Basic health check
curl http://localhost:8000/health

# Database readiness check
curl http://localhost:8000/ready

# API documentation
open http://localhost:8000/docs
```

## Project Structure

```
foozball/
├── README.md                    # This file
├── docker-compose.yml          # PostgreSQL container setup
├── TECH_STACK.md              # Technology stack documentation
├── FEATURES_PLAN.md           # Detailed feature roadmap
├── DATABASE_SCHEMA.md         # Database design documentation
├── API_STANDARDS.md           # API design standards
├── CONFIG_MANAGEMENT.md       # Configuration strategy
├── MONITORING_LOGGING.md      # Logging and monitoring setup
├── CICD_PIPELINE.md           # CI/CD pipeline design
├── scripts/
│   └── init-db.sql            # Database initialization
└── backend/
    ├── pyproject.toml         # Python dependencies and config
    ├── alembic.ini           # Alembic configuration
    ├── .env                  # Environment variables (local)
    ├── app/
    │   ├── __init__.py
    │   ├── main.py           # FastAPI application entry point
    │   ├── api/              # API route definitions
    │   ├── core/             # Core configuration and utilities
    │   │   └── config.py     # Pydantic settings configuration
    │   ├── db/               # Database setup and connections
    │   │   └── database.py   # SQLAlchemy engine and session
    │   ├── models/           # SQLAlchemy models
    │   │   └── player.py     # Player model definition
    │   ├── services/         # Business logic layer
    │   └── utils/            # Utility functions
    ├── migrations/           # Alembic database migrations
    │   ├── env.py           # Alembic environment configuration
    │   └── versions/        # Migration files
    └── tests/               # Test files (future)
```

## Current Database Schema

### Players Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(100) | Player name (unique) |
| email | String(255) | Player email (optional, unique) |
| elo_rating | Float | Current ELO rating (default: 1500.0) |
| trueskill_mu | Float | TrueSkill skill estimate (default: 25.0) |
| trueskill_sigma | Float | TrueSkill uncertainty (default: 8.3333) |
| games_played | Integer | Total games played |
| wins | Integer | Total wins |
| losses | Integer | Total losses |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |
| is_active | Boolean | Active status |

## Available API Endpoints

### Root Endpoint
- **GET /** - Basic API information
  ```json
  {
    "name": "Foosball ELO Tracker",
    "version": "1.0.0",
    "status": "healthy",
    "environment": "development"
  }
  ```

### Health Checks
- **GET /health** - Basic health check
  ```json
  {
    "status": "healthy",
    "service": "foosball-api",
    "version": "1.0.0",
    "environment": "development"
  }
  ```

- **GET /ready** - Readiness check with database connectivity
  ```json
  {
    "status": "ready",
    "service": "foosball-api",
    "version": "1.0.0",
    "environment": "development",
    "checks": {
      "database": "healthy"
    }
  }
  ```

### Interactive API Documentation
- **GET /docs** - Swagger UI
- **GET /redoc** - ReDoc documentation

## Configuration

The application uses environment-based configuration through `.env` files:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foosball_dev
DB_USER=foosball_user
DB_PASSWORD=dev_password

# Application Configuration
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
SECRET_KEY=dev-secret-key-change-in-production
```

## Database Operations

### View Current Schema
```bash
# Connect to database
docker exec -it foosball_postgres psql -U foosball_user -d foosball_dev

# List tables
\dt

# Describe players table
\d players

# Exit
\q
```

### Migration Commands
```bash
# Create new migration
uv run --directory backend alembic revision --autogenerate -m "Description"

# Apply migrations
uv run --directory backend alembic upgrade head

# View migration history
uv run --directory backend alembic history

# Rollback migration
uv run --directory backend alembic downgrade -1
```

## Development Workflow

### Making Changes

1. **Database Changes:**
   ```bash
   # 1. Modify models in app/models/
   # 2. Create migration
   uv run --directory backend alembic revision --autogenerate -m "Description"
   # 3. Review generated migration
   # 4. Apply migration
   uv run --directory backend alembic upgrade head
   ```

2. **Code Changes:**
   ```bash
   # Server auto-reloads when files change
   uv run --project backend uvicorn app.main:app --reload
   ```

### Stopping Services

```bash
# Stop API server
# Ctrl+C or pkill -f uvicorn

# Stop database
docker-compose down

# Stop and remove volumes (careful - deletes data!)
docker-compose down -v
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL container is running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`
   - Verify environment variables in `.env`

2. **Migration Errors**
   - Ensure database is running
   - Check if models are properly imported in `app/models/__init__.py`
   - Verify Alembic can connect: `uv run --directory backend alembic current`

3. **Import Errors**
   - Ensure backend package is installed: `uv pip install -e backend`
   - Check Python path and virtual environment

4. **Port Already in Use**
   - Change port: `--port 8001`
   - Kill existing process: `pkill -f uvicorn`

### Useful Commands

```bash
# Check uv environment
uv run --directory backend python --version

# Test database connection manually
docker exec foosball_postgres psql -U foosball_user -d foosball_dev -c "SELECT version();"

# View API logs
# (logs appear in terminal where uvicorn is running)

# Check container status
docker ps
docker-compose ps
```

## Next Steps

The foundation is solid! Here's what's coming next:

### Phase 0.1 Remaining Tasks
- [ ] Set up pytest with test database
- [ ] Configure pre-commit hooks (Ruff)
- [ ] Set up basic CI/CD pipeline

### Phase 1 - MVP Development
- [ ] Player management API endpoints
- [ ] Game recording functionality
- [ ] Basic ELO rating calculations
- [ ] Frontend React application

## Contributing

This project follows our planned development phases. See `FEATURES_PLAN.md` for the complete roadmap and `TECH_STACK.md` for technology decisions.

For questions or issues, refer to the detailed documentation files in the project root.