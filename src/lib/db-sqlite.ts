import Database from 'better-sqlite3';
import { join } from 'path';
import { Game, Player, Tournament, Board, GameStatus, TournamentStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Initialize database
const dbPath = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), 'data', 'tictactoe.db') 
  : join(process.cwd(), 'data', 'tictactoe-dev.db');

// Ensure the directory exists
import { mkdirSync, existsSync } from 'fs';
const dir = join(process.cwd(), 'data');
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
function initializeDatabase() {
  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      current_game_id TEXT,
      tournament_id TEXT
    )
  `);

  // Games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      board TEXT NOT NULL,
      players TEXT NOT NULL,
      current_turn TEXT NOT NULL,
      winner TEXT,
      status TEXT NOT NULL,
      tournament_id TEXT,
      next_round_game_id TEXT
    )
  `);

  // Tournaments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      players TEXT NOT NULL,
      games TEXT NOT NULL,
      rounds INTEGER NOT NULL,
      current_round INTEGER NOT NULL,
      winner_id TEXT
    )
  `);
}

// Initialize the database
initializeDatabase();

// Prepared statements
const createPlayerStmt = db.prepare(`
  INSERT INTO players (id, name, current_game_id, tournament_id)
  VALUES (?, ?, ?, ?)
`);

const getPlayerStmt = db.prepare(`
  SELECT * FROM players WHERE id = ?
`);

const updatePlayerStmt = db.prepare(`
  UPDATE players SET
    name = ?,
    current_game_id = ?,
    tournament_id = ?
  WHERE id = ?
`);

const createGameStmt = db.prepare(`
  INSERT INTO games (id, board, players, current_turn, winner, status, tournament_id, next_round_game_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const getGameStmt = db.prepare(`
  SELECT * FROM games WHERE id = ?
`);

const updateGameStmt = db.prepare(`
  UPDATE games SET
    board = ?,
    players = ?,
    current_turn = ?,
    winner = ?,
    status = ?,
    tournament_id = ?,
    next_round_game_id = ?
  WHERE id = ?
`);

const createTournamentStmt = db.prepare(`
  INSERT INTO tournaments (id, name, status, players, games, rounds, current_round, winner_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const getTournamentStmt = db.prepare(`
  SELECT * FROM tournaments WHERE id = ?
`);

const updateTournamentStmt = db.prepare(`
  UPDATE tournaments SET
    name = ?,
    status = ?,
    players = ?,
    games = ?,
    rounds = ?,
    current_round = ?,
    winner_id = ?
  WHERE id = ?
`);

const getActiveTournamentsStmt = db.prepare(`
  SELECT * FROM tournaments WHERE status != 'completed' ORDER BY id DESC
`);

const getTournamentGamesStmt = db.prepare(`
  SELECT * FROM games WHERE tournament_id = ?
`);

// Helper functions to convert between DB rows and app types
function playerFromRow(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    currentGameId: row.current_game_id,
    tournamentId: row.tournament_id
  };
}

function gameFromRow(row: any): Game {
  return {
    id: row.id,
    board: JSON.parse(row.board) as Board,
    players: JSON.parse(row.players),
    currentTurn: row.current_turn as 'x' | 'o',
    winner: row.winner,
    status: row.status as GameStatus,
    tournamentId: row.tournament_id,
    nextRoundGameId: row.next_round_game_id
  };
}

function tournamentFromRow(row: any): Tournament {
  return {
    id: row.id,
    name: row.name,
    status: row.status as TournamentStatus,
    players: JSON.parse(row.players),
    games: JSON.parse(row.games),
    rounds: row.rounds,
    currentRound: row.current_round,
    winnerId: row.winner_id
  };
}

// Player operations
export async function createPlayer(name: string): Promise<Player> {
  const id = uuidv4();
  createPlayerStmt.run(id, name, null, null);
  
  const row = getPlayerStmt.get(id);
  return playerFromRow(row);
}

export async function getPlayer(id: string): Promise<Player | null> {
  const row = getPlayerStmt.get(id);
  return row ? playerFromRow(row) : null;
}

export async function updatePlayer(player: Player): Promise<Player> {
  updatePlayerStmt.run(
    player.name,
    player.currentGameId || null,
    player.tournamentId || null,
    player.id
  );
  
  const row = getPlayerStmt.get(player.id);
  return playerFromRow(row);
}

// Game operations
export async function createGame(game: Omit<Game, 'id'>): Promise<Game> {
  const id = uuidv4();
  createGameStmt.run(
    id,
    JSON.stringify(game.board),
    JSON.stringify(game.players),
    game.currentTurn,
    game.winner || null,
    game.status,
    game.tournamentId || null,
    game.nextRoundGameId || null
  );
  
  const row = getGameStmt.get(id);
  return gameFromRow(row);
}

export async function getGame(id: string): Promise<Game | null> {
  const row = getGameStmt.get(id);
  return row ? gameFromRow(row) : null;
}

export async function updateGame(game: Game): Promise<Game> {
  updateGameStmt.run(
    JSON.stringify(game.board),
    JSON.stringify(game.players),
    game.currentTurn,
    game.winner || null,
    game.status,
    game.tournamentId || null,
    game.nextRoundGameId || null,
    game.id
  );
  
  const row = getGameStmt.get(game.id);
  return gameFromRow(row);
}

// Tournament operations
export async function createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
  const id = uuidv4();
  createTournamentStmt.run(
    id,
    tournament.name,
    tournament.status,
    JSON.stringify(tournament.players),
    JSON.stringify(tournament.games),
    tournament.rounds,
    tournament.currentRound,
    tournament.winnerId || null
  );
  
  const row = getTournamentStmt.get(id);
  return tournamentFromRow(row);
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const row = getTournamentStmt.get(id);
  return row ? tournamentFromRow(row) : null;
}

export async function updateTournament(tournament: Tournament): Promise<Tournament> {
  updateTournamentStmt.run(
    tournament.name,
    tournament.status,
    JSON.stringify(tournament.players),
    JSON.stringify(tournament.games),
    tournament.rounds,
    tournament.currentRound,
    tournament.winnerId || null,
    tournament.id
  );
  
  const row = getTournamentStmt.get(tournament.id);
  return tournamentFromRow(row);
}

export async function getActiveTournaments(): Promise<Tournament[]> {
  const rows = getActiveTournamentsStmt.all();
  return rows.map(tournamentFromRow);
}

export async function getTournamentGames(tournamentId: string): Promise<Game[]> {
  const rows = getTournamentGamesStmt.all(tournamentId);
  return rows.map(gameFromRow);
}

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15)); 