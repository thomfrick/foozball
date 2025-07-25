# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start (Full Stack)

#### Option 1: Docker Development (Recommended)
```bash
# Start full stack with Docker (database + backend + frontend)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Check services are running
docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps

# Follow logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
```

#### Option 2: Local Development
```bash
# Start database
docker-compose up db -d && sleep 30

# Start backend API server
uv run --project backend uvicorn app.main:app --reload

# In another terminal, start frontend dev server
npm run dev --prefix frontend
```

#### Option 3: Database + Frontend Only (for API development)
```bash
# Start database and frontend in Docker
docker-compose up db -d
docker-compose --profile dev up frontend-dev
```

### Backend Commands
- **Install dependencies**: `uv sync --dev --project backend && uv pip install -e backend`
- **Start database**: `docker-compose up db -d`
- **Start API server**: `uv run --project backend uvicorn app.main:app --reload`
- **Run migrations**: `uv run --directory backend alembic upgrade head`
- **Create migration**: `uv run --directory backend alembic revision --autogenerate -m "description"`

### Frontend Commands
- **Install dependencies**: `npm install --prefix frontend`
- **Start dev server**: `npm run dev --prefix frontend`
- **Build for production**: `npm run build --prefix frontend`
- **Preview production build**: `npm run preview --prefix frontend`

### Testing

#### Docker Testing (Recommended)
- **Full stack tests**:
  ```bash
  # Start services
  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

  # Run backend tests
  docker exec foosball_backend uv run pytest -v --tb=short

  # Run frontend tests
  docker exec foosball_frontend_dev npm test run
  ```

#### Backend Testing (Local)
- **All tests**: `uv run --directory backend pytest tests/ -v`
- **Unit tests only**: `uv run --directory backend pytest tests/unit/ -v`
- **Integration tests**: `uv run --directory backend pytest tests/integration/ -v`
- **Coverage report**: `uv run --directory backend pytest tests/ --cov=app --cov-report=term-missing`
- **Quick test (stop on first failure)**: `uv run --directory backend pytest tests/ -x`
- **Specific test file**: `uv run --directory backend pytest tests/unit/test_models.py -v`

#### Frontend Testing (Local)
- **Run all tests**: `npm run test:run --prefix frontend`
- **Watch mode**: `npm run test --prefix frontend`
- **Coverage report**: `npm run test:coverage --prefix frontend`

### Code Quality
#### Backend
- **Lint**: `cd backend && uv run ruff check .`
- **Format**: `cd backend && uv run ruff format .`
- **Lint check (CI style)**: `uv run --directory backend ruff check .`

#### Frontend
- **Lint**: `npm run lint --prefix frontend`
- **Fix linting**: `npm run lint:fix --prefix frontend`
- **Format**: `npm run format --prefix frontend`
- **Check formatting**: `npm run format:check --prefix frontend`

## Architecture Overview

### Tech Stack
- **Backend**: FastAPI (Python 3.11+) with SQLAlchemy ORM
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: PostgreSQL 15 running in Docker
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for API state
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library (frontend), pytest (backend)
- **Package Managers**: uv (backend), npm (frontend)
- **Migrations**: Alembic for database schema versioning
- **Rating System**: TrueSkill

### Project Structure
```
backend/
├── app/
│   ├── main.py           # FastAPI app entry point with health endpoints
│   ├── core/config.py    # Environment-based configuration
│   ├── db/database.py    # SQLAlchemy database setup
│   ├── models/           # SQLAlchemy models (Player model exists)
│   ├── schemas/          # Pydantic request/response schemas
│   ├── api/v1/           # API endpoints (players CRUD implemented)
│   ├── services/         # Business logic layer (future)
│   └── utils/            # Shared utilities (future)
├── migrations/           # Alembic database migrations
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── pyproject.toml       # Dependencies and tool configuration
└── run_tests.py         # Test runner script

frontend/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/           # Page components (Home, Players, About, 404)
│   ├── api/             # API client and endpoints
│   ├── hooks/           # Custom React hooks (TanStack Query)
│   ├── types/           # TypeScript type definitions
│   ├── test/            # Test setup and utilities
│   ├── App.tsx          # Main App component with routing
│   └── main.tsx         # App entry point with providers
├── tests/               # Component and integration tests
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── .env                 # Environment variables
```

### Current Implementation Status
- **✅ Phase 0.1 Complete**: Backend Foundation (FastAPI + PostgreSQL)
- **✅ Phase 0.2 Complete**: Frontend Foundation (React + TypeScript + Vite)
- **✅ Phase 1.1 Complete**: Full Player Management API (CRUD operations)
- **⏳ Next Phase**: Phase 0.3 Integration Testing or Phase 1.1.F Frontend Player Management
- **Database**: Players table with TrueSkill ratings, game statistics
- **API Endpoints**: `/players` CRUD, `/health`, `/ready`, `/docs`
- **Frontend**: Full routing, API client, health checks, component testing
- **Test Coverage**: Backend 89%, Frontend 4 tests passing

### Key Patterns
- **Database**: Uses SQLAlchemy with async-compatible Session dependency injection
- **Error Handling**: Proper HTTP exceptions with detailed error messages
- **Validation**: Pydantic schemas for request/response validation
- **Soft Deletes**: Players marked as `is_active=False` instead of hard deletion
- **Pagination**: Built-in pagination for list endpoints with metadata
- **Health Checks**: Separate `/health` (basic) and `/ready` (database check) endpoints

### Environment Variables
Create `backend/.env` with:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foosball_dev
DB_USER=foosball_user
DB_PASSWORD=dev_password
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
SECRET_KEY=dev-secret-key-change-in-production
```

### Database Access
- **Connect directly**: `docker exec -it foosball_postgres psql -U foosball_user -d foosball_dev`
- **Check tables**: `\dt` (in psql)
- **Reset database**: `docker-compose down -v && docker-compose up db -d`

### Pre-commit Hooks
- **Ruff** linting and formatting (Python)
- **Unit tests** run automatically on Python file changes
- **File quality** checks (trailing whitespace, large files, etc.)
- **Future**: ESLint/Prettier for frontend when added

### Development Workflow
1. Start database: `docker-compose up db -d`
2. Install/update dependencies: `uv sync --dev --project backend`
3. Run migrations: `uv run --directory backend alembic upgrade head`
4. Start API: `uv run --project backend uvicorn app.main:app --reload`
5. Test endpoints: Open http://localhost:8000/docs for Swagger UI
6. Run tests before committing: `uv run --directory backend pytest tests/ -v`

### Troubleshooting
- **Port 8000 in use**: `lsof -i :8000` then `pkill -f uvicorn`
- **Database connection issues**: Check `docker ps`, restart with `docker-compose restart db`
- **Import errors**: Ensure `uv pip install -e backend` was run after dependency changes
- **Migration conflicts**: Check `uv run --directory backend alembic current` and history

### API Documentation
- **Interactive docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json
