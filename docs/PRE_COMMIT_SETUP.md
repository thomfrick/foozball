# Pre-commit Hooks Setup

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality and consistency across both backend (Python) and frontend (TypeScript/React) codebases.

## 🔧 What's Configured

### Backend (Python) Checks
- **Ruff**: Linting and code formatting (replaces Black, flake8, isort)
- **Bandit**: Security vulnerability scanning
- **Unit Tests**: Fast unit tests run before each commit
- **Import Validation**: Ensures all imports are working correctly
- **Migration Check**: Validates Alembic migrations are in sync

### Frontend (TypeScript/React) Checks
- **ESLint**: TypeScript and React linting with recommended rules
- **Prettier**: Code formatting for JS/TS/CSS/JSON files
- **Type Checking**: TypeScript compilation validation (when frontend exists)

### General File Checks
- Trailing whitespace removal
- End-of-file newline enforcement
- YAML/JSON/TOML syntax validation
- Large file prevention (>1MB)
- Merge conflict detection
- Line ending normalization (LF)

## 🚀 Installation

Pre-commit hooks are automatically installed when you run:

```bash
# Backend setup includes pre-commit installation
uv sync --directory backend

# Install the git hooks (done automatically in project setup)
uv run --directory backend pre-commit install
```

## 💡 Usage

### Automatic (Recommended)
Pre-commit hooks run automatically on every `git commit`:

```bash
git add .
git commit -m "Your commit message"
# Hooks run automatically and may modify files
# If files are modified, you'll need to stage and commit again
```

### Manual Execution
Run hooks manually on all files:

```bash
# Run all hooks on all files
uv run --directory backend pre-commit run --all-files

# Run specific hook
uv run --directory backend pre-commit run ruff
uv run --directory backend pre-commit run backend-unit-tests
```

### Bypassing Hooks (Not Recommended)
Only use in emergencies:

```bash
git commit --no-verify -m "Emergency commit (bypasses hooks)"
```

## 🔍 Hook Details

### Backend Hooks

| Hook | Purpose | Auto-fix | When it runs |
|------|---------|----------|--------------|
| `ruff` | Python linting | ✅ | Python files changed |
| `ruff-format` | Python formatting | ✅ | Python files changed |
| `bandit` | Security scanning | ❌ | Python files changed |
| `backend-unit-tests` | Fast unit tests | ❌ | Backend Python files changed |
| `backend-import-check` | Import validation | ❌ | Backend app files changed |
| `backend-migration-check` | Migration sync | ❌ | Models/migrations changed |

### Frontend Hooks (Active when frontend/ exists)

| Hook | Purpose | Auto-fix | When it runs |
|------|---------|----------|--------------|
| `eslint` | TS/React linting | ✅ | Frontend files changed |
| `prettier` | Code formatting | ✅ | Frontend files changed |

### File Quality Hooks

| Hook | Purpose | Auto-fix | When it runs |
|------|---------|----------|--------------|
| `trailing-whitespace` | Remove trailing spaces | ✅ | All text files |
| `end-of-file-fixer` | Add final newline | ✅ | All text files |
| `check-yaml` | YAML syntax validation | ❌ | YAML files |
| `check-json` | JSON syntax validation | ❌ | JSON files |
| `check-toml` | TOML syntax validation | ❌ | TOML files |

## 🛠️ Configuration Files

- **Main config**: `.pre-commit-config.yaml` (project root)
- **Ruff config**: `backend/pyproject.toml` (under `[tool.ruff]`)
- **Bandit config**: `backend/pyproject.toml` (under `[tool.bandit]`)
- **Frontend config**: `frontend/.eslintrc.js`, `frontend/.prettierrc` (when created)

## 🐛 Troubleshooting

### Hook Installation Issues
```bash
# Reinstall hooks
uv run --directory backend pre-commit uninstall
uv run --directory backend pre-commit install

# Update hook repositories
uv run --directory backend pre-commit autoupdate
```

### Persistent Failures
```bash
# Clear pre-commit cache
uv run --directory backend pre-commit clean

# Run without cache
uv run --directory backend pre-commit run --all-files
```

### Frontend Hook Errors (Before Frontend Setup)
- Frontend hooks (ESLint, Prettier) are automatically skipped when `frontend/` doesn't exist
- They'll activate automatically once you create the frontend directory

### Performance Issues
If hooks are slow:
- Unit tests run only on backend changes (not all files)
- Consider using `git commit --no-verify` for work-in-progress commits
- Run full test suite separately: `uv run --directory backend pytest`

## 📝 Adding New Hooks

To add new hooks, edit `.pre-commit-config.yaml`:

```yaml
- repo: https://github.com/example/new-hook
  rev: v1.0.0
  hooks:
    - id: new-hook-id
      name: descriptive-name
      files: ^backend/  # Only run on backend files
```

Then update the hooks:
```bash
uv run --directory backend pre-commit install --install-hooks
```

## 🎯 Best Practices

1. **Commit frequently**: Small commits are easier to fix if hooks fail
2. **Stage incrementally**: Use `git add -p` for partial staging
3. **Fix automatically**: Let auto-fix hooks do their work, then review changes
4. **Test locally**: Run hooks manually before pushing
5. **Document exceptions**: If you must bypass hooks, document why

## 📊 Example Workflow

```bash
# 1. Make your changes
vim backend/app/api/v1/players.py

# 2. Stage your changes
git add backend/app/api/v1/players.py

# 3. Commit (triggers hooks)
git commit -m "Add new player validation"

# 4. If hooks modify files, stage and commit again
git add .
git commit -m "Add new player validation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🔗 Resources

- [Pre-commit Documentation](https://pre-commit.com/)
- [Ruff Configuration](https://docs.astral.sh/ruff/configuration/)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
