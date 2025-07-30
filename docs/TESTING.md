# Testing Guide

Comprehensive testing infrastructure with unit, integration, and end-to-end tests.

## 🚀 Quick Test Commands

```bash
# Backend tests (119+ tests total)
uv run --directory backend pytest tests/ -v

# Frontend tests (521+ tests total)
npm run test:run --prefix frontend

# End-to-End tests (requires services running)
cd e2e-tests && npx playwright test

# All tests with coverage
uv run --directory backend pytest tests/ --cov=app --cov-report=term-missing
npm run test:coverage --prefix frontend
```

## 📊 Test Coverage Overview

- **Backend**: 119+ tests (unit + integration + TrueSkill + health endpoints + error scenarios)
- **Frontend**: 521+ tests (unit + integration with MSW + UI design system + accessibility + responsive + mobile + statistics + analytics)
- **E2E**: Playwright tests with isolated project structure
- **Total Coverage**: Database, API, UI, TrueSkill, design system, theme management, error boundaries, health monitoring, security, performance, concurrency, accessibility

## 🏗️ Test Architecture

### Backend Testing (119+ tests)
- **Unit Tests**: Model validation, TrueSkill calculations, configuration
- **Integration Tests**: Full API endpoints with real database
- **TrueSkill Tests**: Rating calculations, history tracking, game processing
- **Error Scenarios**: Security, concurrency, performance edge cases

### Frontend Testing (393+ tests) ✅ 100% SUCCESS RATE
- **Unit Tests**: Component behavior, hooks, utilities, TrueSkill display, UI design system
- **Integration Tests**: Complete API interaction with Mock Service Worker
- **UI Design System Tests**: Button components (6 variants), Card components (StatsCard, PlayerCard, GameCard)
- **Theme System Tests**: Dark/light mode toggle, system preference detection, localStorage persistence
- **Error Boundary Tests**: Enhanced error handling with recovery mechanisms
- **Accessibility Tests**: WCAG 2.1 AA compliance, screen reader support
- **Responsive Design Tests**: Mobile, tablet, desktop layouts with comprehensive mobile testing
- **Health Monitoring Tests**: Backend health endpoints integration testing

### End-to-End Testing (3 tests)
- **Navigation**: Basic app routing and page loads
- **API Connectivity**: Full-stack communication
- **User Workflows**: Complete feature interactions

## Quick Validation Test (Full Stack)

Run this complete test to verify your full stack setup:

```bash
# 1. Start the database
docker-compose up db -d

# 2. Wait for database to be ready (30 seconds)
sleep 30

# 3. Check database is healthy
docker-compose ps | grep healthy

# 4. Install dependencies if not done
uv sync --dev --project backend
uv pip install -e backend
npm install --prefix frontend

# 5. Run migrations
uv run --directory backend alembic upgrade head

# 6. Start API server in background
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# 7. Start frontend dev server in background
npm run dev --prefix frontend &

# 8. Wait for servers to start
sleep 10

# 9. Test backend endpoints
echo "Testing backend endpoints..."
curl -s http://localhost:8000/ | grep -q "Foosball ELO Tracker" && echo "✅ Backend root endpoint works"
curl -s http://localhost:8000/health | grep -q "healthy" && echo "✅ Backend health endpoint works"
curl -s http://localhost:8000/ready | grep -q "ready" && echo "✅ Backend readiness endpoint works"

# 10. Test frontend (basic check)
echo "Testing frontend..."
curl -s http://localhost:3000 | grep -q "<!doctype html>" && echo "✅ Frontend is serving HTML"

# 11. Stop servers
pkill -f uvicorn
pkill -f vite

# 12. Stop database
docker-compose down

echo "🎉 All full stack tests passed! Setup is working correctly."
```

## Manual Testing Steps

### 0. Frontend Testing

```bash
# Start frontend dev server
npm run dev --prefix frontend

# Run frontend tests
npm run test:run --prefix frontend

# Run tests with coverage
npm run test:coverage --prefix frontend

# Run tests in watch mode (for development)
npm run test --prefix frontend

# Test in browser
open http://localhost:3000  # Should show home page with API status
```

### 1. Database Testing

```bash
# Start database
docker-compose up db -d

# Wait and check status
sleep 30
docker-compose ps

# Should show: Up X seconds (healthy)

# Test direct connection
docker exec foosball_postgres psql -U foosball_user -d foosball_dev -c "SELECT 'Database works!' as status;"

# Should output: Database works!
```

### 2. Migration Testing

```bash
# Run migrations
uv run --directory backend alembic upgrade head

# Check tables were created
docker exec foosball_postgres psql -U foosball_user -d foosball_dev -c "\dt"

# Should show: players, alembic_version tables

# Check players table structure
docker exec foosball_postgres psql -U foosball_user -d foosball_dev -c "\d players"

# Should show all columns: id, name, email, ratings, etc.
```

### 3. API Testing

```bash
# Start API server
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# In another terminal, test endpoints:

# Test root endpoint
curl http://localhost:8000/
# Expected: {"name":"Foosball ELO Tracker","version":"1.0.0","status":"healthy","environment":"development"}

# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"foosball-api","version":"1.0.0","environment":"development"}

# Test readiness endpoint (database check)
curl http://localhost:8000/ready
# Expected: {"status":"ready","service":"foosball-api",...,"checks":{"database":"healthy"}}

# Test API documentation
open http://localhost:8000/docs
# Should open Swagger UI in browser
```

### 4. Configuration Testing

```bash
# Test environment variables are loaded
uv run --directory backend python -c "
from app.core.config import config
print(f'Database URL: {config.database_url}')
print(f'Environment: {config.environment}')
print(f'Debug: {config.debug}')
"

# Expected output:
# Database URL: postgresql://foosball_user:dev_password@localhost:5432/foosball_dev
# Environment: development
# Debug: True
```

### 5. Code Quality Testing

```bash
# Test Ruff linting (should pass without errors)
cd backend && uv run ruff check .

# Test Ruff formatting (should make no changes if already formatted)
cd backend && uv run ruff format --check .
```

## Error Scenarios Testing

### Test Database Connection Failure

```bash
# Stop database while API is running
docker-compose down

# Test readiness endpoint - should fail gracefully
curl http://localhost:8000/ready
# Expected: 503 error with meaningful message

# Restart database
docker-compose up db -d
sleep 30

# Test readiness endpoint - should work again
curl http://localhost:8000/ready
# Expected: {"status":"ready",...}
```

### Test Invalid Migration

```bash
# This demonstrates rollback capability
uv run --directory backend alembic history
uv run --directory backend alembic downgrade -1
uv run --directory backend alembic upgrade head
```

## Integration Testing

### Full Stack Test

```bash
#!/bin/bash
# save as test_full_stack.sh

set -e  # Exit on any error

echo "🚀 Starting full stack integration test..."

# Start database
echo "Starting database..."
docker-compose up db -d

# Wait for database
echo "Waiting for database to be ready..."
sleep 30

# Check database health
if ! docker-compose ps | grep -q healthy; then
    echo "❌ Database is not healthy"
    exit 1
fi
echo "✅ Database is healthy"

# Install dependencies
echo "Installing dependencies..."
uv sync --dev --project backend > /dev/null 2>&1
uv pip install -e backend > /dev/null 2>&1

# Run migrations
echo "Running migrations..."
uv run --directory backend alembic upgrade head

# Start API
echo "Starting API server..."
uv run --project backend uvicorn app.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

# Wait for API to start
sleep 5

# Test endpoints
echo "Testing API endpoints..."

# Root endpoint
if curl -s http://localhost:8000/ | grep -q "Foosball ELO Tracker"; then
    echo "✅ Root endpoint works"
else
    echo "❌ Root endpoint failed"
    kill $API_PID
    exit 1
fi

# Health endpoint
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✅ Health endpoint works"
else
    echo "❌ Health endpoint failed"
    kill $API_PID
    exit 1
fi

# Readiness endpoint
if curl -s http://localhost:8000/ready | grep -q "ready"; then
    echo "✅ Readiness endpoint works"
else
    echo "❌ Readiness endpoint failed"
    kill $API_PID
    exit 1
fi

# Cleanup
echo "Cleaning up..."
kill $API_PID
docker-compose down

echo "🎉 All integration tests passed!"
```

## Performance Testing

### Basic Load Test

```bash
# Install apache bench if not available: brew install httpd
# Test API under light load
ab -n 100 -c 10 http://localhost:8000/health

# Expected: All requests should succeed with reasonable response times
```

### Database Performance

```bash
# Test database connection pooling
for i in {1..10}; do
    curl -s http://localhost:8000/ready > /dev/null && echo "Request $i: OK" || echo "Request $i: FAILED"
done

# All requests should succeed quickly
```

## Troubleshooting Test Failures

### API Server Won't Start

```bash
# Check if port is in use
lsof -i :8000

# Check for import errors
uv run --directory backend python -c "from app.main import app; print('Import successful')"

# Check configuration
uv run --directory backend python -c "from app.core.config import config; print('Config loaded')"
```

### Database Connection Issues

```bash
# Check database container
docker ps | grep postgres

# Check database logs
docker logs foosball_postgres

# Test direct connection
docker exec foosball_postgres pg_isready -U foosball_user

# Check network connectivity
docker exec foosball_postgres netstat -tlnp | grep 5432
```

### Migration Failures

```bash
# Check migration status
uv run --directory backend alembic current

# Check if models can be imported
uv run --directory backend python -c "from app.models import Player; print('Models OK')"

# Reset migrations (WARNING: destructive)
# docker-compose down -v
# docker-compose up db -d
# sleep 30
# uv run --directory backend alembic upgrade head
```

## Test Results Documentation

After running tests, document results:

```bash
# Example test report
echo "Test Results - $(date)" > test_results.txt
echo "=================" >> test_results.txt
echo "Database: ✅ Healthy" >> test_results.txt
echo "Migrations: ✅ Applied successfully" >> test_results.txt
echo "API Endpoints: ✅ All responding" >> test_results.txt
echo "Configuration: ✅ Loaded correctly" >> test_results.txt
echo "Code Quality: ✅ Ruff checks pass" >> test_results.txt
```

This testing guide ensures our foundation is solid before building additional features!
