# 🏓 Foosball TrueSkill Tracker

A modern web application for tracking foosball games and managing player ratings using the TrueSkill rating system.

## 🚀 Quick Start

**Get up and running in under 5 minutes!**

### Prerequisites
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Node.js](https://nodejs.org/) - JavaScript runtime (v18+)
- [Docker](https://www.docker.com/) - For PostgreSQL database
- Python 3.11+

### Quick Setup (Full Stack)

```bash
# 1. Start the database
docker-compose up db -d && sleep 30

# 2. Install and setup backend
uv sync --dev --project backend
uv pip install -e backend
uv run --directory backend alembic upgrade head

# 3. Install and setup frontend
npm install --prefix frontend

# 4. Start backend API server
uv run --project backend uvicorn app.main:app --reload

# 5. In another terminal, start frontend dev server
npm run dev --prefix frontend
```

**🎉 That's it!**
- Backend API: http://localhost:8000/docs (interactive docs)
- Frontend App: http://localhost:3000 (React app)

### Alternative: Docker Development

```bash
# Full stack with Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Verify Everything Works

```bash
# Test backend endpoints
curl http://localhost:8000/health     # Basic health check
curl http://localhost:8000/ready      # Database connectivity check
curl http://localhost:8000/           # API information

# Frontend should show API status on the home page
open http://localhost:3000            # React app with API connectivity test
```

## 📊 Current Status

**Last Updated:** July 25, 2025
**Current Phase:** Phase 0.2 Frontend Foundation ✅ COMPLETED
**Overall Progress:** 🟢 On Track - Full Stack Ready!

See the [FEATURES_PLAN.md](FEATURES_PLAN.md) for the complete development roadmap.

### ✅ What's Working Right Now

#### Backend (Phase 0.1 + 1.1 Complete)
- **Modern FastAPI API** with auto-reload and interactive docs
- **PostgreSQL 15** database running in Docker
- **Database migrations** with Alembic for schema versioning
- **Health monitoring** endpoints with database connectivity checks
- **Production-ready configuration** with environment-based settings
- **Code quality enforcement** with pre-commit hooks (Ruff, testing)
- **Comprehensive testing** (48 tests, 89% coverage)
- **Full Player Management API** (Create, Read, Update, Delete)

#### Frontend (Phase 0.2 Complete)
- **Modern React 19** with TypeScript and Vite
- **Tailwind CSS** for beautiful, responsive styling
- **TanStack Query** for powerful API state management
- **React Router** for client-side routing
- **Vitest + React Testing Library** for component testing
- **ESLint + Prettier** for code quality and formatting
- **Type-safe API client** with full backend integration
- **Docker support** for development and production

## 🎯 Next Steps

1.  **Phase 0.3 - Integration Testing** (Verify full stack works together)
2.  **Phase 1.1.F - Frontend Player Management** (Connect UI to Player API)
3.  **Phase 1.2 - Game Recording** (Backend + Frontend)

## 📚 Documentation

For more detailed information, please see the documentation in the `/docs` directory:

- **[Development Guide](docs/DEVELOPMENT.md)**: Daily workflow commands.
- **[Testing Guide](docs/TESTING.md)**: How to run tests and verify functionality.
- **[Technology Stack](docs/TECH_STACK.md)**: Overview of the technologies used.
- **[API Standards](docs/API_STANDARDS.md)**: API design conventions.
- **[Database Schema](docs/DATABASE_SCHEMA.md)**: Detailed database design.
- **[Configuration Management](docs/CONFIG_MANAGEMENT.md)**: How configuration is handled.
- **[CI/CD Pipeline](docs/CICD_PIPELINE.md)**: Continuous integration and deployment strategy.
- **[Pre-commit Setup](docs/PRE_COMMIT_SETUP.md)**: Code quality hooks setup.

## 🤝 Contributing

This project follows test-driven development and maintains high code quality standards. Please see the [Development Guide](docs/DEVELOPMENT.md) and [Pre-commit Setup](docs/PRE_COMMIT_SETUP.md) for more details on how to contribute.

**Happy coding!** 🎉
