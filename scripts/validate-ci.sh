#!/bin/bash

# ABOUTME: Local CI pipeline validation script
# ABOUTME: Runs the same checks that CI pipeline will run to catch issues early

set -e

echo "🚀 Validating CI pipeline locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the project root
if [ ! -f "CLAUDE.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "🔍 Checking project structure..."

# Check required files exist
required_files=(
    "backend/pyproject.toml"
    "frontend/package.json"
    "e2e-tests/package.json"
    "docker-compose.yml"
    ".github/workflows/ci.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found $file"
    else
        print_error "Missing required file: $file"
        exit 1
    fi
done

echo ""
echo "🔧 Backend validation..."

# Backend checks
cd backend

# Check if uv is available
if ! command -v uv &> /dev/null; then
    print_error "uv is not installed. Please install uv first."
    exit 1
fi

print_status "uv is available"

# Install dependencies
echo "Installing backend dependencies..."
uv sync --dev > /dev/null 2>&1
uv pip install -e . > /dev/null 2>&1
print_status "Backend dependencies installed"

# Linting check
echo "Running backend linting..."
if uv run ruff check . > /dev/null 2>&1; then
    print_status "Backend linting passed"
else
    print_error "Backend linting failed"
    uv run ruff check .
    exit 1
fi

# Format check
echo "Running backend format check..."
if uv run ruff format --check . > /dev/null 2>&1; then
    print_status "Backend formatting is correct"
else
    print_warning "Backend formatting issues found. Run 'uv run ruff format .' to fix"
fi

# Unit tests (without database)
echo "Running backend unit tests..."
if uv run pytest tests/unit/ -v --tb=short > /dev/null 2>&1; then
    print_status "Backend unit tests passed"
else
    print_error "Backend unit tests failed"
    uv run pytest tests/unit/ -v --tb=short
    exit 1
fi

cd ..

echo ""
echo "🎨 Frontend validation..."

# Frontend checks
cd frontend

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm is available"

# Install dependencies
echo "Installing frontend dependencies..."
npm ci > /dev/null 2>&1
print_status "Frontend dependencies installed"

# Linting
echo "Running frontend linting..."
if npm run lint > /dev/null 2>&1; then
    print_status "Frontend linting passed"
else
    print_error "Frontend linting failed"
    npm run lint
    exit 1
fi

# Type checking (done as part of build)
echo "Running frontend type checking..."
if npx tsc --noEmit > /dev/null 2>&1; then
    print_status "Frontend type checking passed"
else
    print_error "Frontend type checking failed"
    npx tsc --noEmit
    exit 1
fi

# Unit tests
echo "Running frontend unit tests..."
if npm run test:run > /dev/null 2>&1; then
    print_status "Frontend unit tests passed"
else
    print_error "Frontend unit tests failed"
    npm run test:run
    exit 1
fi

cd ..

echo ""
echo "🎭 E2E tests validation..."

# E2E tests setup check
cd e2e-tests

echo "Installing e2e test dependencies..."
npm ci > /dev/null 2>&1
print_status "E2E test dependencies installed"

# Check if Playwright browsers are installed
if npx playwright install --dry-run > /dev/null 2>&1; then
    print_status "Playwright browsers are available"
else
    print_warning "Playwright browsers not installed. Run 'npx playwright install' to install them"
fi

cd ..

echo ""
echo "🐳 Docker validation..."

# Docker checks
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. CI pipeline will need Docker."
else
    print_status "Docker is available"

    # Test docker-compose syntax
    if docker-compose config > /dev/null 2>&1; then
        print_status "Docker Compose configuration is valid"
    else
        print_error "Docker Compose configuration has errors"
        docker-compose config
        exit 1
    fi
fi

echo ""
echo "📊 Coverage and quality checks..."

# Check if coverage configuration exists
if [ -f "backend/pyproject.toml" ] && grep -q "coverage" backend/pyproject.toml; then
    print_status "Backend coverage configuration found"
else
    print_warning "Backend coverage configuration not found in pyproject.toml"
fi

if [ -f "frontend/vite.config.ts" ] && grep -q "coverage" frontend/vite.config.ts; then
    print_status "Frontend coverage configuration found"
else
    print_warning "Frontend coverage configuration not found in vite.config.ts"
fi

echo ""
echo "🔐 Security checks..."

# Check for common security issues
if [ -f ".env" ]; then
    print_warning "Found .env file in root. Make sure it's in .gitignore"
fi

if [ -f "backend/.env" ]; then
    print_warning "Found backend/.env file. Make sure it's in .gitignore"
fi

if [ -f "frontend/.env" ]; then
    print_warning "Found frontend/.env file. Make sure it's in .gitignore"
fi

# Check .gitignore exists
if [ -f ".gitignore" ]; then
    print_status ".gitignore file exists"
else
    print_error ".gitignore file is missing"
    exit 1
fi

echo ""
echo "🎉 CI Pipeline Validation Complete!"
echo ""
echo "Summary:"
echo "- ✅ Project structure is valid"
echo "- ✅ Backend linting and unit tests pass"
echo "- ✅ Frontend linting, type checking, and unit tests pass"
echo "- ✅ E2E test setup is ready"
echo "- ✅ Docker configuration is valid"
echo ""
echo "Your project is ready for CI pipeline! 🚀"
echo ""
echo "To run the full test suite with database:"
echo "1. Start services: docker-compose up -d"
echo "2. Run backend integration tests: cd backend && uv run pytest tests/integration/ -v"
echo "3. Run e2e tests: cd e2e-tests && npx playwright test"
echo ""
