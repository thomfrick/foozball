# 🏓 Foosball ELO Tracker

A modern web application for tracking foosball games and managing player ratings using the TrueSkill rating system.

## 🚀 Quick Start

**Get up and running in under 5 minutes!**

### Prerequisites
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Docker](https://www.docker.com/) - For PostgreSQL database
- Python 3.11+

### One-Command Setup

```bash
# 1. Start the database
docker-compose up db -d && sleep 30

# 2. Install dependencies and setup backend
uv sync --dev --project backend
uv pip install -e backend

# 3. Run database migrations
uv run --directory backend alembic upgrade head

# 4. Start the API server
uv run --project backend uvicorn app.main:app --reload
```

**🎉 That's it!** Open http://localhost:8000/docs to see the interactive API documentation.

### Verify Everything Works

```bash
# Test endpoints (run in another terminal)
curl http://localhost:8000/health     # Basic health check
curl http://localhost:8000/ready      # Database connectivity check
curl http://localhost:8000/           # API information
```

## 📊 Current Status

**Last Updated:** July 25, 2025
**Current Phase:** Phase 1.1 Player Management ✅ COMPLETED
**Overall Progress:** 🟢 On Track

See the [FEATURES_PLAN.md](FEATURES_PLAN.md) for the complete development roadmap.

### ✅ What's Working Right Now

- **Modern FastAPI API** with auto-reload and interactive docs.
- **PostgreSQL 15** database running in Docker.
- **Database migrations** with Alembic for schema versioning.
- **Health monitoring** endpoints with database connectivity checks.
- **Production-ready configuration** with environment-based settings.
- **Code quality enforcement** with pre-commit hooks (Ruff, testing).
- **Comprehensive testing** (48 tests, 89% coverage).
- **Full Player Management API** (Create, Read, Update, Delete).

## 🎯 Next Steps

1.  **Phase 1.2 - Game Recording** (Ready to start)
2.  **Phase 0.2 - Frontend Foundation**
3.  **Phase 1.3 - Basic Rating System**

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
