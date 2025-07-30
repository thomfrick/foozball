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

Choose your preferred development method:

#### Option 1: Docker Development (Recommended for simplicity)

```bash
# Start full stack with Docker (database + backend + frontend)
docker-compose up --build

# That's it! Everything runs in Docker:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000/docs
# - Database: localhost:5432
```

#### Option 2: Local Development (Recommended for active development)

```bash
# 1. Start database only
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

# Frontend tests (521+ tests total)
npm run test:run --prefix frontend

# End-to-End tests (3 tests - requires services running)
cd e2e-tests && npx playwright test
```

## 📊 Current Status

**Last Updated:** July 30, 2025
**Current Phase:** Phase 2.4 Enhanced Statistics & Analytics Dashboard ✅ COMPLETE
**Overall Progress:** 🏆 Full-Featured Application with Advanced Analytics, Team Games, and Professional UI!

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

#### Frontend Complete with Advanced Features (Phases 0.2 → 2.4)
- **Modern React 19** with TypeScript and Vite (TanStack Query v5 compatible)
- **Complete Player Management** - Add, edit, delete, search with pagination
- **Complete Game Recording** - Full game entry with player selection and games page
- **Team Games (2v2)** - Complete team gameplay with TrueSkill team ratings
- **Data Visualization** - 4 interactive chart types (Rating Progression, Win/Loss Streaks, Multi-Player Comparison, Team Rating)
- **Enhanced Statistics & Analytics Dashboard** - Comprehensive analytics with head-to-head analysis
- **TrueSkill Leaderboard** - Professional ranking with uncertainty indicators and enhanced features
- **Rating Displays** - Beautiful TrueSkill visualization with tooltips
- **Professional UI Design System** - Modern Button and Card components with variants
- **Dark/Light Theme Support** - System preference detection with toggle
- **Enhanced Error Boundaries** - Comprehensive error handling with recovery
- **Responsive Design** - Mobile-first with Tailwind CSS and extensive mobile testing
- **Type-safe API integration** with TanStack Query v5
- **Comprehensive testing** (521+ tests passing with extensive coverage)

#### Advanced Features Complete (Phases 1.3 → 2.4)
- **TrueSkill Algorithm** - Individual and team skill assessment with confidence intervals
- **Conservative Ratings** - 99.7% confidence intervals (μ - 3σ) for reliable rankings
- **Team Rating System** - Advanced 2v2 team TrueSkill implementation
- **Interactive Data Visualization** - Professional charts with recharts integration
- **Head-to-Head Analysis** - Detailed player matchup statistics and game history
- **Statistics Dashboard** - Comprehensive tabbed analytics interface with real-time data
- **Enhanced Leaderboard** - Sorting, filtering, pagination with performance metrics
- **Player Statistics Panel** - Detailed performance tracking and rating progression
- **Uncertainty Visualization** - High/Medium/Low certainty indicators
- **Educational Tooltips** - Explains TrueSkill system to users
- **Rating History** - Complete audit trail of rating changes
- **Professional UI Design System** - Modern component library with consistent styling
- **Theme Management** - Dark/light mode with system preference detection
- **Enhanced Error Handling** - Robust error boundaries with user-friendly recovery
- **Health Monitoring** - Comprehensive health endpoints for system monitoring
- **Mobile-First Design** - Fully responsive with extensive mobile testing
- **Accessibility Compliance** - WCAG 2.1 AA compliant with comprehensive testing

## 🎯 Next Steps

**Phase 2 Complete!** All core functionality with advanced analytics implemented.

**Phase 3 - Advanced Competitive Features:**
1.  **Phase 3.1 - Tournament System** (Bracket generation, competitive play, tournament management)
2.  **Phase 3.2 - Enhanced Player Profiles** (Achievements, detailed stats, player progression)
3.  **Phase 3.3 - Advanced Analytics** (Prediction algorithms, performance insights, trends analysis)
4.  **Phase 3.4 - Real-time Features** (WebSocket support, live updates, real-time notifications)

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
