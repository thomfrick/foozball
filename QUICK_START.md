# ⚡ Quick Start Guide

**Get the Foosball ELO Tracker running in under 5 minutes!**

## 🚀 One-Command Setup

```bash
# Clone and start everything
git clone <repo-url> foosball
cd foosball

# Start database
docker-compose up db -d && sleep 30

# Install and setup backend
uv sync --dev --project backend
uv pip install -e backend
uv run --directory backend alembic upgrade head

# Start API server
uv run --project backend uvicorn app.main:app --reload
```

Open http://localhost:8000/docs - you're ready to go! 🎉

## 🧪 Verify Everything Works

```bash
# Test all endpoints (run in another terminal)
curl http://localhost:8000/health     # Should return: {"status":"healthy"...}
curl http://localhost:8000/ready      # Should return: {"status":"ready"...}
curl http://localhost:8000/           # Should return: {"name":"Foosball ELO Tracker"...}
```

## 📂 Project Structure

```
foosball/
├── README.md              # 📖 Full documentation
├── DEVELOPMENT.md         # 🛠️ Daily workflow commands
├── TESTING.md            # 🧪 How to test everything
├── STATUS.md             # 📊 Current progress
├── docker-compose.yml    # 🐳 Database setup
└── backend/
    ├── app/
    │   ├── main.py       # 🚀 FastAPI app
    │   ├── core/config.py # ⚙️ Configuration
    │   ├── db/database.py # 🗄️ Database setup
    │   └── models/player.py # 📊 Player model
    └── migrations/       # 🔄 Database migrations
```

## 💡 What You Have Now

- ✅ **Modern FastAPI API** with auto-reload
- ✅ **PostgreSQL database** in Docker
- ✅ **Database migrations** with Alembic
- ✅ **Health monitoring** endpoints
- ✅ **Interactive API docs** at /docs
- ✅ **Production-ready configuration**

## 🎯 Next Steps

1. **Add your first player** (coming soon - API endpoints)
2. **Record games** (coming soon - game management)
3. **View ratings** (coming soon - ELO calculations)
4. **Build frontend** (coming soon - React app)

## 🆘 Quick Fixes

**Port 8000 in use?**
```bash
pkill -f uvicorn
# or use different port: --port 8001
```

**Database issues?**
```bash
docker-compose restart db
```

**Need fresh start?**
```bash
docker-compose down -v
# Run setup commands again
```

## 📚 More Help

- **Full setup:** See `README.md`
- **Daily commands:** See `DEVELOPMENT.md`
- **Testing:** See `TESTING.md`
- **Progress:** See `STATUS.md`

**Happy coding!** 🚀
