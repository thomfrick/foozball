# Foosball TrueSkill Tracker - CI/CD Pipeline

## Pipeline Strategy

We'll use GitHub Actions for CI/CD with a focus on automated testing, code quality, and deployment safety.

## GitHub Actions Workflows

### 1. Code Quality & Testing (`.github/workflows/test.yml`)

**Triggers:**
- Push to any branch
- Pull requests to main
- Scheduled runs (daily)

**Backend Jobs:**
```yaml
backend-test:
  - Set up Python with uv
  - Install dependencies with uv
  - Run Ruff linting and formatting check
  - Run pytest with coverage
  - Upload coverage to Codecov
  - Run security scan with bandit
  - Check for vulnerabilities with safety
```

**Frontend Jobs:**
```yaml
frontend-test:
  - Set up Node.js
  - Install dependencies with npm ci
  - Run ESLint
  - Run Prettier check
  - Run Vitest with coverage
  - Run build test
  - Upload coverage to Codecov
```

**Database Jobs:**
```yaml
database-test:
  - Start PostgreSQL service
  - Run migration tests (up/down)
  - Validate schema integrity
  - Test seed data
```

### 2. Deployment Pipeline (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to main branch (after tests pass)
- Manual trigger for hotfixes

**Staging Deployment:**
```yaml
deploy-staging:
  - Build and test Docker images
  - Deploy to staging environment
  - Run smoke tests
  - Run end-to-end tests with Playwright
  - Notify team of deployment
```

**Production Deployment:**
```yaml
deploy-production:
  - Require manual approval
  - Blue-green deployment strategy
  - Database migration (with rollback plan)
  - Health checks
  - Performance monitoring alerts
  - Rollback capability
```

### 3. Dependency Updates (`.github/workflows/deps.yml`)

**Triggers:**
- Weekly schedule
- Manual trigger

**Tasks:**
```yaml
update-deps:
  - Update Python dependencies with uv
  - Update Node.js dependencies
  - Run full test suite
  - Create PR if tests pass
  - Auto-merge if minor/patch updates
```

## Quality Gates

### Pre-Commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: ruff-check
        name: Ruff Linting
        entry: ruff check
        language: system
        files: \.py$

      - id: ruff-format
        name: Ruff Formatting
        entry: ruff format
        language: system
        files: \.py$

      - id: pytest
        name: Python Tests
        entry: pytest tests/ -x -v
        language: system
        files: \.py$
        pass_filenames: false

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
```

### Branch Protection Rules
- Require PR reviews (minimum 1)
- Require status checks to pass
- Require branches to be up to date
- No force pushes to main
- Dismiss stale reviews on new commits

## Testing Strategy

### Backend Testing Levels
```python
# Test pyramid structure
- Unit Tests (70%): Fast, isolated component tests
- Integration Tests (20%): Database + API endpoint tests
- E2E Tests (10%): Full workflow tests with test database
```

### Frontend Testing Levels
```javascript
// Test pyramid structure
- Unit Tests (70%): Component and utility function tests
- Integration Tests (20%): Multi-component interaction tests
- E2E Tests (10%): Full user workflow tests with Playwright
```

### Database Testing
- Migration tests (up/down)
- Constraint validation tests
- Performance tests for common queries
- Data integrity tests

## Environment Strategy

### Development
- Local Docker Compose setup
- Hot reloading enabled
- Test database with seed data
- All logging enabled

### Staging
- Production-like environment
- Real database (smaller dataset)
- Performance monitoring
- Feature flag testing
- User acceptance testing

### Production
- High availability setup
- Database backups and monitoring
- Error tracking and alerting
- Performance monitoring
- Feature flags for gradual rollouts

## Deployment Strategy

### Database Migrations
```python
# Migration safety checklist
1. Backward compatible changes only
2. Test rollback procedures
3. Migration performance testing
4. Zero-downtime deployment support
5. Data migration validation
```

### Docker Strategy
```dockerfile
# Multi-stage builds for optimization
- Development: Full dev tools, hot reload
- Production: Minimal runtime, optimized layers
- Testing: Test dependencies included
```

### Infrastructure as Code
```yaml
# docker-compose.prod.yml structure
services:
  web:          # FastAPI backend
  frontend:     # React production build
  db:           # PostgreSQL with backups
  redis:        # Caching layer (future)
  nginx:        # Reverse proxy + static files
```

## Monitoring & Alerting

### Health Checks
- API endpoint health (`/health`, `/ready`)
- Database connectivity
- External service dependencies
- Performance thresholds

### Metrics Collection
- Response times and throughput
- Error rates and types
- Database query performance
- User engagement metrics

### Alert Conditions
- API response time > 2s
- Error rate > 1%
- Database connection issues
- Disk space < 20%
- Memory usage > 80%

## Security Scanning

### Code Security
- Bandit for Python security issues
- npm audit for Node.js vulnerabilities
- Dependency vulnerability scanning
- Secrets detection (prevent commits)

### Container Security
- Vulnerability scanning of Docker images
- Non-root user execution
- Minimal base images
- Regular base image updates

## Performance Testing

### Load Testing
- Artillery.js for API load testing
- Database performance under load
- Memory leak detection
- Response time regression testing

### Benchmarking
- Rating calculation performance
- Database query optimization
- Frontend bundle size monitoring
- Lighthouse CI for web performance

## Rollback Strategy

### Database Rollbacks
- Always test rollback migrations
- Data backup before major changes
- Point-in-time recovery capability
- Rollback testing in staging

### Application Rollbacks
- Blue-green deployment for instant rollback
- Feature flags for gradual rollouts
- Automated rollback on health check failures
- Communication plan for rollbacks

## Documentation Integration

### API Documentation
- Automatic OpenAPI spec generation
- API docs deployment with each release
- Changelog generation from PR titles
- Breaking change notifications

## Phase 0 Integration

These CI/CD components should be added to Phase 0:

### 0.1 Backend Foundation
- [ ] 0.1.9 Set up GitHub Actions for backend testing
- [ ] 0.1.10 Configure pre-commit hooks
- [ ] 0.1.11 Set up basic deployment pipeline

### 0.2 Frontend Foundation
- [ ] 0.2.8 Set up GitHub Actions for frontend testing
- [ ] 0.2.9 Configure Playwright for E2E testing

### 0.3 Integration Testing
- [ ] 0.3.6 Set up staging environment
- [ ] 0.3.7 Test full CI/CD pipeline end-to-end
- [ ] 0.3.8 Configure monitoring and alerting
