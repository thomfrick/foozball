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

### 🧪 Run Test Suite

```bash
# Backend tests (119+ tests total)
uv run --directory backend pytest tests/ -v

# Frontend tests (155+ tests total)
npm run test:run --prefix frontend

# End-to-End tests (3 tests - requires services running)
cd e2e-tests && npx playwright test
```

## 📊 Current Status

**Last Updated:** July 26, 2025
**Current Phase:** Phase 1.3 TrueSkill System ✅ COMPLETED
**Overall Progress:** 🟢 Full MVP with TrueSkill Ratings Complete!

See the [FEATURES_PLAN.md](FEATURES_PLAN.md) for the complete development roadmap.

### ✅ What's Working Right Now

#### Backend MVP Complete (Phases 0.1 → 1.3)
- **Modern FastAPI API** with auto-reload and interactive docs
- **PostgreSQL 15** database running in Docker with full schema
- **Player Management API** - Complete CRUD with validation and soft deletes
- **Game Recording API** - Full game tracking with player validation
- **TrueSkill Rating System** - Microsoft TrueSkill with automatic rating updates
- **Rating History Tracking** - Complete audit trail of all rating changes
- **Database migrations** with Alembic for schema versioning
- **Comprehensive testing** (119+ tests total, 90%+ coverage)
- **Production-ready configuration** with environment-based settings

#### Frontend MVP Complete (Phases 0.2 → 1.3)
- **Modern React 19** with TypeScript and Vite
- **Complete Player Management** - Add, edit, delete, search with pagination
- **Complete Game Recording** - Full game entry with player selection
- **TrueSkill Leaderboard** - Professional ranking with uncertainty indicators
- **Rating Displays** - Beautiful TrueSkill visualization with tooltips
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Type-safe API integration** with TanStack Query
- **Comprehensive testing** (155+ tests passing)

#### Advanced Features Complete
- **TrueSkill Algorithm** - Accurate skill assessment (not just win/loss)
- **Conservative Ratings** - 99.7% confidence intervals (μ - 3σ)
- **Uncertainty Visualization** - High/Medium/Low certainty indicators
- **Educational Tooltips** - Explains TrueSkill system to users
- **Rating History** - Complete audit trail of rating changes
- **Professional UI/UX** - Polished interface with accessibility features

## 🎯 Next Steps

1.  **Phase 1.4 - Core UI/UX Polish** (Navigation, dark mode, accessibility)
2.  **Phase 2.1 - Team Games (2v2)** (TrueSkill team ratings)
3.  **Phase 2.2 - Data Visualization** (Rating progression charts)
4.  **Phase 2.3 - Enhanced Statistics** (Head-to-head, trends, analytics)

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
