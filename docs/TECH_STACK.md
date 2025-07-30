# Foosball TrueSkill Tracker - Technology Stack

## Backend Stack (Python)

### Core Framework
- **FastAPI** - Modern, fast web framework with automatic API documentation
- **Python 3.11+** - Latest stable Python version for performance and features
- **uv** - Ultra-fast Python package installer and environment manager

### Database & ORM
- **PostgreSQL** - Robust relational database for game data and player statistics
- **SQLAlchemy** - Python ORM for database interactions
- **Alembic** - Database migration tool (works with SQLAlchemy)

### Data Validation & Serialization
- **Pydantic** - Data validation and serialization (built into FastAPI)

### TrueSkill Rating System
- **python-trueskill** - Microsoft's TrueSkill rating system (superior to basic ELO for multiplayer games)
  - Handles uncertainty in ratings
  - Better for games with multiple players
  - More accurate rating adjustments

### Authentication (Future)
- **FastAPI-Users** - Complete user management system for FastAPI

### Testing
- **pytest** - Python testing framework
- **pytest-asyncio** - Async testing support

## Frontend Stack (React)

### Core Framework
- **React 19** - Latest React with enhanced concurrent features
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and dev server

### Styling & Design System
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Professional UI Design System** - Modern Button and Card components with variants (primary, secondary, success, danger, outline, ghost)
- **Theme Management** - Dark/light mode toggle with system preference detection and localStorage persistence
- **Error Boundaries** - Enhanced error handling with user-friendly recovery mechanisms

### State Management & API
- **TanStack Query v5 (React Query)** - Server state management and caching with modern API
- **React Hook Form** - Performant forms with easy validation

### Data Visualization & Analytics
- **Recharts** - React charting library for interactive data visualization
  - Rating Progression Charts
  - Win/Loss Streak Charts
  - Multi-Player Comparison Charts
  - Team Rating Charts
- **Advanced Statistics Dashboard** - Comprehensive analytics with head-to-head analysis
- **Enhanced Leaderboard** - Professional ranking with filtering and pagination

### Testing
- **Vitest** - Fast unit testing (Vite-native)
- **React Testing Library** - Component testing utilities

## DevOps & Deployment

### Containerization
- **Docker** - Containerization for consistent environments
- **Docker Compose** - Multi-service orchestration for local development

### Development Tools
- **Pre-commit hooks** - Code quality enforcement
- **Ruff** - Python linting and formatting (replaces Black, isort, flake8)
- **Prettier** - JavaScript/TypeScript formatting
- **ESLint** - JavaScript/TypeScript linting

## Architecture Overview

```
Frontend (React/TypeScript) → FastAPI Backend → PostgreSQL Database
                ↓
        TanStack Query for API state
                ↓
        Recharts for data visualization
```

## Why These Choices?

- **FastAPI**: Excellent performance, automatic docs, native async support
- **uv**: 10-100x faster than pip, excellent dependency resolution, built-in virtual environments
- **PostgreSQL**: ACID compliance, excellent for relational data like games/players
- **TrueSkill**: Better handles uncertainty and multiplayer scenarios compared to ELO
- **TypeScript**: Prevents runtime errors, better IDE support
- **TanStack Query**: Handles caching, background updates, optimistic updates
- **Tailwind**: Rapid prototyping without writing custom CSS
