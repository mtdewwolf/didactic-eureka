-- Schema for Tic-tac-toe tournament application

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  current_game_id UUID,
  tournament_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board JSONB NOT NULL,
  players JSONB NOT NULL,
  current_turn VARCHAR(1) NOT NULL,
  winner UUID,
  status VARCHAR(20) NOT NULL,
  tournament_id UUID,
  next_round_game_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  players JSONB NOT NULL,
  games JSONB NOT NULL,
  rounds INTEGER NOT NULL,
  current_round INTEGER NOT NULL,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_tournament ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_games_next_round ON games(next_round_game_id); 