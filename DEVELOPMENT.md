# Development Guide

Quick reference for common development tasks.

## Daily Development Workflow

### Start Development Environment

```bash
# 1. Start database
docker-compose up db -d

# 2. Start API server (auto-reloads on changes)
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Open API docs in browser
open http://localhost:8000/docs
```

### Stop Development Environment

```bash
# Stop API server: Ctrl+C or
pkill -f uvicorn

# Stop database
docker-compose down
```

## Common Commands

### Database Management

```bash
# Create new migration
uv run --directory backend alembic revision --autogenerate -m "Add new feature"

# Apply migrations
uv run --directory backend alembic upgrade head

# View migration status
uv run --directory backend alembic current

# Rollback one migration
uv run --directory backend alembic downgrade -1

# Connect to database directly
docker exec -it foosball_postgres psql -U foosball_user -d foosball_dev
```

### Package Management

```bash
# Add new dependency
cd backend && uv add package-name

# Add development dependency
cd backend && uv add --dev package-name

# Update dependencies
cd backend && uv sync

# Install project in editable mode (after changes to pyproject.toml)
uv pip install -e backend
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Readiness check (includes database)
curl http://localhost:8000/ready

# Root endpoint
curl http://localhost:8000/

# Pretty print JSON response
curl -s http://localhost:8000/health | jq
```

### Code Quality

```bash
# Run Ruff linting
cd backend && uv run ruff check .

# Run Ruff formatting
cd backend && uv run ruff format .

# Check types (when we add mypy)
# cd backend && uv run mypy app/
```

### Docker Operations

```bash
# View container status
docker-compose ps

# View database logs
docker-compose logs db

# View database logs (follow)
docker-compose logs -f db

# Restart database
docker-compose restart db

# Reset database (WARNING: deletes all data)
docker-compose down -v && docker-compose up db -d
```

## Environment Variables

Create `backend/.env` with:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foosball_dev
DB_USER=foosball_user
DB_PASSWORD=dev_password

# App
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
SECRET_KEY=dev-secret-key-change-in-production
```

## Project Structure Quick Reference

```
backend/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── core/config.py    # Configuration settings
│   ├── db/database.py    # Database connection
│   ├── models/           # SQLAlchemy models
│   ├── api/              # API routes (future)
│   ├── services/         # Business logic (future)
│   └── utils/            # Utilities (future)
├── migrations/           # Alembic migrations
├── tests/               # Tests (future)
├── pyproject.toml       # Dependencies and config
├── alembic.ini         # Alembic config
└── .env                # Environment variables
```

## Quick Debugging

### API Not Starting
```bash
# Check if port is in use
lsof -i :8000

# Kill process on port
pkill -f uvicorn

# Check Python/uv installation
uv --version
uv run --directory backend python --version
```

### Database Issues
```bash
# Check container status
docker ps | grep postgres

# Check database connectivity
docker exec foosball_postgres pg_isready -U foosball_user

# View database logs
docker logs foosball_postgres

# Reset database completely
docker-compose down -v
docker-compose up db -d
uv run --directory backend alembic upgrade head
```

### Migration Issues
```bash
# Check current migration status
uv run --directory backend alembic current

# View migration history
uv run --directory backend alembic history

# Check if models are properly imported
uv run --directory backend python -c "from app.models import Player; print('Models imported successfully')"
```

## VS Code Integration

Recommended `.vscode/settings.json`:

```json
{
    "python.defaultInterpreterPath": "./backend/.venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.ruffEnabled": true,
    "python.formatting.provider": "ruff",
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
```

## Useful Aliases

Add to your shell profile (`.zshrc`, `.bashrc`):

```bash
# Foosball development aliases
alias fdb='docker-compose up db -d'                    # Start database
alias fapi='uv run --project backend uvicorn app.main:app --reload'  # Start API
alias fdown='docker-compose down'                      # Stop services
alias fmigrate='uv run --directory backend alembic upgrade head'     # Run migrations
alias fpsql='docker exec -it foosball_postgres psql -U foosball_user -d foosball_dev'  # Connect to DB
```

## Performance Tips

- Use `--reload` only in development
- Keep database container running between sessions
- Use `uv pip install -e backend` for faster imports during development
- Monitor logs for slow queries and optimize accordingly
