# Development Guide

Quick reference for common development tasks.

## Daily Development Workflow

### Start Development Environment (Full Stack)

#### Option 1: Local Development (Recommended)
```bash
# 1. Start database
docker-compose up db -d

# 2. Start backend API server (auto-reloads on changes)
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. In another terminal, start frontend dev server
npm run dev --prefix frontend

# 4. Open applications
open http://localhost:8000/docs  # Backend API docs
open http://localhost:3000       # Frontend React app
```

#### Option 2: Docker Development
```bash
# Start everything with Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Access applications
open http://localhost:8000/docs  # Backend API docs
open http://localhost:3000       # Frontend React app
```

### Stop Development Environment

#### Local Development
```bash
# Stop servers: Ctrl+C in each terminal or
pkill -f uvicorn  # Stop backend
pkill -f vite     # Stop frontend

# Stop database
docker-compose down
```

#### Docker Development
```bash
# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
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

#### Backend Dependencies
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

#### Frontend Dependencies
```bash
# Install all dependencies
npm install --prefix frontend

# Add new dependency
npm install --prefix frontend package-name

# Add development dependency
npm install --prefix frontend -D package-name

# Update dependencies
npm update --prefix frontend

# Remove dependency
npm uninstall --prefix frontend package-name
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

#### Backend (Python)
```bash
# Run Ruff linting
cd backend && uv run ruff check .

# Run Ruff formatting
cd backend && uv run ruff format .

# Check types (when we add mypy)
# cd backend && uv run mypy app/
```

#### Frontend (TypeScript/React)
```bash
# Run ESLint
npm run lint --prefix frontend

# Fix ESLint issues automatically
npm run lint:fix --prefix frontend

# Run Prettier formatting
npm run format --prefix frontend

# Check if files are formatted
npm run format:check --prefix frontend

# TypeScript type checking (included in build)
npm run build --prefix frontend
```

### Testing

#### Backend Testing
```bash
# Run all backend tests
python backend/run_tests.py

# Run specific test types
python backend/run_tests.py unit
python backend/run_tests.py integration
python backend/run_tests.py coverage
```

#### Frontend Testing
```bash
# Run all frontend tests
npm run test:run --prefix frontend

# Run tests in watch mode (for development)
npm run test --prefix frontend

# Run tests with coverage
npm run test:coverage --prefix frontend
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
