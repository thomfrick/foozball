# Foosball ELO Tracker - Feature Planning

**Last Updated:** July 25, 2025  
**Current Status:** Phase 0.1 ✅ COMPLETED | Phase 1.1 ✅ COMPLETED | Phase 1.2 🔄 READY  
**Git Commit:** e2659b1

## Development Philosophy: Start Small, Build Up

We'll build this in phases, starting with core functionality and adding features incrementally.

## 📊 Overall Progress

- ✅ **Phase 0.1 Backend Foundation** - 100% Complete (10/10 tasks)
- ✅ **Phase 1.1 Player Management** - 100% Complete (10/10 tasks)
- ⏳ **Phase 0.2 Frontend Foundation** - 0% Complete (0/7 tasks)
- ⏳ **Phase 0.3 Integration Testing** - 0% Complete (0/5 tasks)

## Phase 0: Foundation Setup & Testing

### 0.1 Backend Foundation ✅ COMPLETED
- [x] 0.1.1 Initialize Python project with uv (create pyproject.toml, virtual env)
- [x] 0.1.2 Initialize FastAPI project structure
- [x] 0.1.3 Set up PostgreSQL with Docker
- [x] 0.1.4 Configure SQLAlchemy + Alembic
- [x] 0.1.5 Create basic health check endpoint
- [x] 0.1.6 Set up pytest with test database
- [x] 0.1.7 Configure Ruff for linting and formatting (integrated in pyproject.toml)
- [x] 0.1.8 Create Docker Compose for local development
- [x] 0.1.9 Initialize git repository and version control
- [x] 0.1.10 Create comprehensive documentation (README, DEVELOPMENT, TESTING guides)

### 0.2 Frontend Foundation
- [ ] 0.2.1 Initialize React + TypeScript + Vite project
- [ ] 0.2.2 Configure Tailwind CSS
- [ ] 0.2.3 Set up TanStack Query
- [ ] 0.2.4 Create basic routing with React Router
- [ ] 0.2.5 Set up Vitest + React Testing Library
- [ ] 0.2.6 Configure ESLint + Prettier
- [ ] 0.2.7 Create basic API client setup

### 0.3 Integration Testing
- [ ] 0.3.1 Verify full stack communication (API calls work)
- [ ] 0.3.2 Test Docker Compose setup end-to-end
- [ ] 0.3.3 Verify all linting and formatting tools work
- [ ] 0.3.4 Test database migrations and rollbacks
- [ ] 0.3.5 Verify test suites run successfully

## Phase 1: MVP (Minimum Viable Product)

### 1.1 Player Management ✅ COMPLETED (Backend)

#### Backend (1.1.B) ✅ COMPLETED
- [x] 1.1.B.1 Create Player model (id, name, rating, games_played, created_at)
- [x] 1.1.B.2 Create database migration for players table
- [x] 1.1.B.3 Implement POST /players endpoint (create player)
- [x] 1.1.B.4 Implement GET /players endpoint (list all players)
- [x] 1.1.B.5 Implement GET /players/{id} endpoint (get single player)
- [x] 1.1.B.6 Implement DELETE /players/{id} endpoint
- [x] 1.1.B.7 Add validation (unique names, required fields) - implemented in model
- [x] 1.1.B.8 Write unit tests for player model and database operations

#### Frontend (1.1.F)
- [ ] 1.1.F.1 Create Player type definitions
- [ ] 1.1.F.2 Create API hooks for player operations (useCreatePlayer, usePlayers, etc.)
- [ ] 1.1.F.3 Build Add Player form component
- [ ] 1.1.F.4 Build Player List component
- [ ] 1.1.F.5 Build Player Detail/Profile component
- [ ] 1.1.F.6 Add delete player functionality
- [ ] 1.1.F.7 Add form validation and error handling
- [ ] 1.1.F.8 Write component tests

### 1.2 Game Recording

#### Backend (1.2.B)
- [ ] 1.2.B.1 Create Game model (id, player1_id, player2_id, winner_id, created_at)
- [ ] 1.2.B.2 Create database migration for games table
- [ ] 1.2.B.3 Implement POST /games endpoint (record game)
- [ ] 1.2.B.4 Implement GET /games endpoint (list games with pagination)
- [ ] 1.2.B.5 Implement GET /players/{id}/games endpoint (player's games)
- [ ] 1.2.B.6 Add game validation (players exist, winner is one of the players)
- [ ] 1.2.B.7 Write unit tests for all game endpoints

#### Frontend (1.2.F)
- [ ] 1.2.F.1 Create Game type definitions
- [ ] 1.2.F.2 Create API hooks for game operations
- [ ] 1.2.F.3 Build Game Entry form (player selection, winner selection)
- [ ] 1.2.F.4 Build Recent Games list component
- [ ] 1.2.F.5 Build Game History component with pagination
- [ ] 1.2.F.6 Add form validation and error handling
- [ ] 1.2.F.7 Write component tests

### 1.3 Basic ELO System

#### Backend (1.3.B)
- [ ] 1.3.B.1 Implement basic ELO calculation function
- [ ] 1.3.B.2 Create rating update logic after game creation
- [ ] 1.3.B.3 Set default rating for new players (1500)
- [ ] 1.3.B.4 Add rating history tracking (optional: separate table)
- [ ] 1.3.B.5 Update player stats (games_played, wins, losses)
- [ ] 1.3.B.6 Write comprehensive tests for ELO calculations

#### Frontend (1.3.F)
- [ ] 1.3.F.1 Display current ratings on player profiles
- [ ] 1.3.F.2 Show rating changes after games
- [ ] 1.3.F.3 Create basic leaderboard component
- [ ] 1.3.F.4 Add rating display to game history
- [ ] 1.3.F.5 Write tests for rating display components

### 1.4 Core UI/UX

#### Frontend (1.4.F)
- [ ] 1.4.F.1 Create main navigation/layout component
- [ ] 1.4.F.2 Design responsive layout for mobile/desktop
- [ ] 1.4.F.3 Implement loading states for all API calls
- [ ] 1.4.F.4 Add error handling and error boundary
- [ ] 1.4.F.5 Create consistent styling system with Tailwind
- [ ] 1.4.F.6 Add basic animations/transitions
- [ ] 1.4.F.7 Implement dark/light mode toggle
- [ ] 1.4.F.8 Write accessibility tests

## Phase 2: Enhanced Features

### 2.1 TrueSkill Integration

#### Backend (2.1.B)
- [ ] 2.1.B.1 Install and configure python-trueskill library
- [ ] 2.1.B.2 Create TrueSkill rating calculation functions
- [ ] 2.1.B.3 Migrate existing ELO ratings to TrueSkill format
- [ ] 2.1.B.4 Update rating calculations to use TrueSkill
- [ ] 2.1.B.5 Add confidence interval tracking (mu, sigma)
- [ ] 2.1.B.6 Write comprehensive tests for TrueSkill implementation

#### Frontend (2.1.F)
- [ ] 2.1.F.1 Update rating displays to show confidence intervals
- [ ] 2.1.F.2 Add visual indicators for rating uncertainty
- [ ] 2.1.F.3 Update leaderboard to handle TrueSkill rankings
- [ ] 2.1.F.4 Add tooltips explaining TrueSkill vs ELO

### 2.2 Team Games (2v2)

#### Backend (2.2.B)
- [ ] 2.2.B.1 Create Team model (id, player1_id, player2_id, rating_mu, rating_sigma)
- [ ] 2.2.B.2 Create TeamGame model (id, team1_id, team2_id, winner_team_id, created_at)
- [ ] 2.2.B.3 Create database migrations for team tables
- [ ] 2.2.B.4 Implement POST /teams endpoint (create team)
- [ ] 2.2.B.5 Implement POST /team-games endpoint (record team game)
- [ ] 2.2.B.6 Implement GET /team-games endpoint (list team games)
- [ ] 2.2.B.7 Add team rating calculations using TrueSkill
- [ ] 2.2.B.8 Write unit tests for team functionality

#### Frontend (2.2.F)
- [ ] 2.2.F.1 Create Team and TeamGame type definitions
- [ ] 2.2.F.2 Build team selection interface
- [ ] 2.2.F.3 Create team game entry form
- [ ] 2.2.F.4 Build team leaderboard component
- [ ] 2.2.F.5 Add team game history view
- [ ] 2.2.F.6 Write tests for team components

### 2.3 Data Visualization

#### Frontend (2.3.F)
- [ ] 2.3.F.1 Install and configure Recharts
- [ ] 2.3.F.2 Create rating progression chart component
- [ ] 2.3.F.3 Build multi-player comparison charts
- [ ] 2.3.F.4 Create win/loss streak visualization
- [ ] 2.3.F.5 Add interactive chart controls (zoom, filter)
- [ ] 2.3.F.6 Create responsive chart layouts
- [ ] 2.3.F.7 Write tests for chart components

### 2.4 Enhanced Statistics

#### Backend (2.4.B)
- [ ] 2.4.B.1 Create statistics calculation endpoints
- [ ] 2.4.B.2 Implement head-to-head record queries
- [ ] 2.4.B.3 Add win/loss ratio calculations
- [ ] 2.4.B.4 Create recent form tracking (last N games)
- [ ] 2.4.B.5 Add performance trend analysis
- [ ] 2.4.B.6 Write tests for statistics calculations

#### Frontend (2.4.F)
- [ ] 2.4.F.1 Create detailed statistics dashboard
- [ ] 2.4.F.2 Build head-to-head comparison view
- [ ] 2.4.F.3 Add performance indicators to player profiles
- [ ] 2.4.F.4 Create match history with detailed stats
- [ ] 2.4.F.5 Add filtering and sorting to statistics
- [ ] 2.4.F.6 Write tests for statistics components

## Phase 3: Advanced Features

### 3.1 Tournament System

#### Backend (3.1.B)
- [ ] 3.1.B.1 Create Tournament model (id, name, type, status, max_players, created_at)
- [ ] 3.1.B.2 Create TournamentParticipant model (tournament_id, player_id, seed)
- [ ] 3.1.B.3 Create TournamentGame model (tournament_id, game_id, round, match_number)
- [ ] 3.1.B.4 Implement POST /tournaments endpoint (create tournament)
- [ ] 3.1.B.5 Implement bracket generation algorithms (single elimination)
- [ ] 3.1.B.6 Implement round-robin tournament logic
- [ ] 3.1.B.7 Add tournament progression and winner calculation
- [ ] 3.1.B.8 Write comprehensive tournament tests

#### Frontend (3.1.F)
- [ ] 3.1.F.1 Create Tournament type definitions
- [ ] 3.1.F.2 Build tournament creation interface
- [ ] 3.1.F.3 Create bracket visualization component
- [ ] 3.1.F.4 Build tournament registration interface
- [ ] 3.1.F.5 Create tournament leaderboard/standings
- [ ] 3.1.F.6 Add tournament game entry workflow
- [ ] 3.1.F.7 Write tests for tournament components

### 3.2 Enhanced Player Profiles

#### Backend (3.2.B)
- [ ] 3.2.B.1 Add profile fields to Player model (bio, avatar_url, achievements)
- [ ] 3.2.B.2 Create Achievement model and tracking system
- [ ] 3.2.B.3 Implement file upload for profile pictures
- [ ] 3.2.B.4 Add favorite opponents tracking
- [ ] 3.2.B.5 Create player comparison endpoints
- [ ] 3.2.B.6 Write tests for profile enhancements

#### Frontend (3.2.F)
- [ ] 3.2.F.1 Build profile editing interface
- [ ] 3.2.F.2 Create avatar upload component
- [ ] 3.2.F.3 Design achievement badge system
- [ ] 3.2.F.4 Build enhanced player profile views
- [ ] 3.2.F.5 Add player comparison interface
- [ ] 3.2.F.6 Write tests for profile components

### 3.3 Advanced Analytics

#### Backend (3.3.B)
- [ ] 3.3.B.1 Create time-based performance analysis
- [ ] 3.3.B.2 Implement matchup prediction algorithms
- [ ] 3.3.B.3 Add performance trend calculations
- [ ] 3.3.B.4 Create advanced statistics endpoints
- [ ] 3.3.B.5 Add data export functionality (CSV, JSON)
- [ ] 3.3.B.6 Write tests for analytics features

#### Frontend (3.3.F)
- [ ] 3.3.F.1 Create advanced analytics dashboard
- [ ] 3.3.F.2 Build prediction interface
- [ ] 3.3.F.3 Add time-based performance charts
- [ ] 3.3.F.4 Create matchup analysis views
- [ ] 3.3.F.5 Add data export interface
- [ ] 3.3.F.6 Write tests for analytics components

## Phase 4: Polish & Extras

### 4.1 Mobile Optimization

#### Frontend (4.1.F)
- [ ] 4.1.F.1 Optimize responsive design for mobile
- [ ] 4.1.F.2 Add touch-friendly interactions
- [ ] 4.1.F.3 Implement offline support with service workers
- [ ] 4.1.F.4 Add PWA manifest and installation prompts
- [ ] 4.1.F.5 Optimize performance for mobile devices
- [ ] 4.1.F.6 Test across multiple mobile browsers

### 4.2 Admin Features

#### Backend (4.2.B)
- [ ] 4.2.B.1 Create admin authentication system
- [ ] 4.2.B.2 Implement game editing endpoints
- [ ] 4.2.B.3 Add rating recalculation tools
- [ ] 4.2.B.4 Create player merging functionality
- [ ] 4.2.B.5 Add data backup and restore features
- [ ] 4.2.B.6 Write admin functionality tests

#### Frontend (4.2.F)
- [ ] 4.2.F.1 Build admin dashboard
- [ ] 4.2.F.2 Create game editing interface
- [ ] 4.2.F.3 Add rating management tools
- [ ] 4.2.F.4 Build player management interface
- [ ] 4.2.F.5 Add data management tools
- [ ] 4.2.F.6 Write admin interface tests

### 4.3 External Integrations

#### Backend (4.3.B)
- [ ] 4.3.B.1 Create webhook system for external notifications
- [ ] 4.3.B.2 Implement Slack bot integration
- [ ] 4.3.B.3 Add Discord bot functionality
- [ ] 4.3.B.4 Create API for external applications
- [ ] 4.3.B.5 Add rate limiting and API authentication
- [ ] 4.3.B.6 Write integration tests

#### Frontend (4.3.F)
- [ ] 4.3.F.1 Build integration configuration interface
- [ ] 4.3.F.2 Add webhook management tools
- [ ] 4.3.F.3 Create API key management
- [ ] 4.3.F.4 Write integration interface tests

## Database Schema Evolution

### Phase 1 Tables
- `players` (id, name, rating, games_played, created_at)
- `games` (id, player1_id, player2_id, winner_id, created_at)

### Phase 2 Additions
- `teams` (id, player1_id, player2_id, rating, games_played)
- `team_games` (id, team1_id, team2_id, winner_team_id, created_at)

### Phase 3 Additions
- `tournaments` (id, name, type, status, created_at)
- `tournament_participants` (tournament_id, player_id)
- `tournament_games` (id, tournament_id, game_id, round)

## Success Metrics

### Phase 1 Success
- Can record games and see updated ratings
- All players can view their current standing
- System works reliably for daily use

### Phase 2 Success
- Accurate TrueSkill ratings
- Team games work seamlessly
- Visual rating progression is engaging

### Phase 3 Success
- Tournament system drives engagement
- Rich statistics provide insights
- Users actively explore their data

## Next Steps

1. Set up basic project structure
2. Create database schema for Phase 1
3. Build MVP backend API endpoints
4. Create basic React frontend
5. Deploy and test with real users