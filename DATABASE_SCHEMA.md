# Foosball ELO Tracker - Database Schema Design

## Schema Evolution Strategy

We'll design the schema to handle all phases from the start, using database migrations to add features incrementally without breaking changes.

## Core Tables (Phase 1)

### players
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,  -- For future auth
    elo_rating DECIMAL(8,2) DEFAULT 1500.00,
    trueskill_mu DECIMAL(8,4) DEFAULT 25.0000,  -- TrueSkill mean
    trueskill_sigma DECIMAL(8,4) DEFAULT 8.3333,  -- TrueSkill std dev
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    -- Future fields (nullable initially)
    bio TEXT,
    avatar_url VARCHAR(500),
    achievements JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_elo_rating ON players(elo_rating DESC);
CREATE INDEX idx_players_trueskill_mu ON players(trueskill_mu DESC);
CREATE INDEX idx_players_active ON players(is_active);
```

### games
```sql
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    winner_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    game_type VARCHAR(20) DEFAULT 'singles' CHECK (game_type IN ('singles', 'doubles')),
    tournament_id INTEGER,  -- FK added later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,

    CONSTRAINT check_different_players CHECK (player1_id != player2_id),
    CONSTRAINT check_valid_winner CHECK (winner_id IN (player1_id, player2_id))
);

CREATE INDEX idx_games_player1 ON games(player1_id);
CREATE INDEX idx_games_player2 ON games(player2_id);
CREATE INDEX idx_games_winner ON games(winner_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_tournament ON games(tournament_id);
```

### rating_history
```sql
CREATE TABLE rating_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    rating_before DECIMAL(8,2) NOT NULL,
    rating_after DECIMAL(8,2) NOT NULL,
    rating_change DECIMAL(8,2) GENERATED ALWAYS AS (rating_after - rating_before) STORED,
    rating_system VARCHAR(20) DEFAULT 'elo' CHECK (rating_system IN ('elo', 'trueskill')),
    trueskill_mu_before DECIMAL(8,4),
    trueskill_mu_after DECIMAL(8,4),
    trueskill_sigma_before DECIMAL(8,4),
    trueskill_sigma_after DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rating_history_player ON rating_history(player_id);
CREATE INDEX idx_rating_history_game ON rating_history(game_id);
CREATE INDEX idx_rating_history_created_at ON rating_history(created_at DESC);
```

## Team Game Tables (Phase 2)

### teams
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    trueskill_mu DECIMAL(8,4) DEFAULT 50.0000,  -- Combined team rating
    trueskill_sigma DECIMAL(8,4) DEFAULT 16.6666,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_different_team_players CHECK (player1_id != player2_id),
    CONSTRAINT unique_team_combination UNIQUE(LEAST(player1_id, player2_id), GREATEST(player1_id, player2_id))
);

CREATE INDEX idx_teams_player1 ON teams(player1_id);
CREATE INDEX idx_teams_player2 ON teams(player2_id);
CREATE INDEX idx_teams_trueskill_mu ON teams(trueskill_mu DESC);
```

### team_games
```sql
CREATE TABLE team_games (
    id SERIAL PRIMARY KEY,
    team1_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team2_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    winner_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tournament_id INTEGER,  -- FK added later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,

    CONSTRAINT check_different_teams CHECK (team1_id != team2_id),
    CONSTRAINT check_valid_team_winner CHECK (winner_team_id IN (team1_id, team2_id))
);

CREATE INDEX idx_team_games_team1 ON team_games(team1_id);
CREATE INDEX idx_team_games_team2 ON team_games(team2_id);
CREATE INDEX idx_team_games_winner ON team_games(winner_team_id);
CREATE INDEX idx_team_games_created_at ON team_games(created_at DESC);
```

### team_rating_history
```sql
CREATE TABLE team_rating_history (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_game_id INTEGER NOT NULL REFERENCES team_games(id) ON DELETE CASCADE,
    trueskill_mu_before DECIMAL(8,4) NOT NULL,
    trueskill_mu_after DECIMAL(8,4) NOT NULL,
    trueskill_sigma_before DECIMAL(8,4) NOT NULL,
    trueskill_sigma_after DECIMAL(8,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_rating_history_team ON team_rating_history(team_id);
CREATE INDEX idx_team_rating_history_game ON team_rating_history(team_game_id);
```

## Tournament Tables (Phase 3)

### tournaments
```sql
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tournament_type VARCHAR(20) NOT NULL CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin')),
    game_type VARCHAR(20) DEFAULT 'singles' CHECK (game_type IN ('singles', 'doubles')),
    max_participants INTEGER,
    status VARCHAR(20) DEFAULT 'registration' CHECK (status IN ('registration', 'in_progress', 'completed', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    winner_id INTEGER REFERENCES players(id),
    winner_team_id INTEGER REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_winner_consistency CHECK (
        (game_type = 'singles' AND winner_id IS NOT NULL AND winner_team_id IS NULL) OR
        (game_type = 'doubles' AND winner_team_id IS NOT NULL AND winner_id IS NULL) OR
        (winner_id IS NULL AND winner_team_id IS NULL)
    )
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX idx_tournaments_tournament_type ON tournaments(tournament_type);
```

### tournament_participants
```sql
CREATE TABLE tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    seed INTEGER,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_participant_type CHECK (
        (player_id IS NOT NULL AND team_id IS NULL) OR
        (team_id IS NOT NULL AND player_id IS NULL)
    ),
    CONSTRAINT unique_tournament_participant UNIQUE(tournament_id, COALESCE(player_id, -1), COALESCE(team_id, -1))
);

CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_player ON tournament_participants(player_id);
CREATE INDEX idx_tournament_participants_team ON tournament_participants(team_id);
```

### tournament_matches
```sql
CREATE TABLE tournament_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
    team_game_id INTEGER REFERENCES team_games(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    participant1_id INTEGER REFERENCES tournament_participants(id),
    participant2_id INTEGER REFERENCES tournament_participants(id),
    winner_participant_id INTEGER REFERENCES tournament_participants(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'bye')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT check_game_consistency CHECK (
        (game_id IS NOT NULL AND team_game_id IS NULL) OR
        (team_game_id IS NOT NULL AND game_id IS NULL) OR
        (game_id IS NULL AND team_game_id IS NULL)
    ),
    CONSTRAINT unique_tournament_match UNIQUE(tournament_id, round_number, match_number)
);

CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_round ON tournament_matches(tournament_id, round_number);
CREATE INDEX idx_tournament_matches_status ON tournament_matches(status);
```

## Administrative Tables (Phase 4)

### achievements
```sql
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50),
    badge_color VARCHAR(20),
    criteria JSONB NOT NULL,  -- Flexible criteria storage
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_active ON achievements(is_active);
```

### player_achievements
```sql
CREATE TABLE player_achievements (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    game_id INTEGER REFERENCES games(id),  -- Which game earned it

    CONSTRAINT unique_player_achievement UNIQUE(player_id, achievement_id)
);

CREATE INDEX idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_earned_at ON player_achievements(earned_at DESC);
```

## Views for Common Queries

### player_stats_view
```sql
CREATE VIEW player_stats_view AS
SELECT
    p.id,
    p.name,
    p.elo_rating,
    p.trueskill_mu,
    p.trueskill_sigma,
    p.games_played,
    p.wins,
    p.losses,
    CASE WHEN p.games_played > 0 THEN ROUND((p.wins::decimal / p.games_played) * 100, 2) ELSE 0 END as win_percentage,
    (
        SELECT COUNT(*)
        FROM games g
        WHERE (g.player1_id = p.id OR g.player2_id = p.id)
        AND g.created_at >= NOW() - INTERVAL '30 days'
    ) as games_last_30_days,
    p.created_at,
    p.is_active
FROM players p;
```

### head_to_head_view
```sql
CREATE VIEW head_to_head_view AS
SELECT
    LEAST(g.player1_id, g.player2_id) as player1_id,
    GREATEST(g.player1_id, g.player2_id) as player2_id,
    COUNT(*) as total_games,
    SUM(CASE WHEN g.winner_id = LEAST(g.player1_id, g.player2_id) THEN 1 ELSE 0 END) as player1_wins,
    SUM(CASE WHEN g.winner_id = GREATEST(g.player1_id, g.player2_id) THEN 1 ELSE 0 END) as player2_wins
FROM games g
GROUP BY LEAST(g.player1_id, g.player2_id), GREATEST(g.player1_id, g.player2_id);
```

## Migration Strategy

1. **Phase 1**: Create core tables (players, games, rating_history)
2. **Phase 2**: Add team tables, update games table with FK
3. **Phase 3**: Add tournament tables, update existing tables
4. **Phase 4**: Add achievement and admin tables

## Performance Considerations

- All foreign keys have corresponding indexes
- Composite indexes for common query patterns
- Generated columns for calculated fields
- Strategic use of partial indexes where appropriate
- Consider partitioning games table by date if volume gets high

## Data Integrity

- Comprehensive CHECK constraints
- Foreign key cascades carefully chosen
- UNIQUE constraints prevent duplicate data
- Generated columns ensure consistency
