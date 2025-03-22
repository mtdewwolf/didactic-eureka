import { sql } from '@vercel/postgres';
import { Game, Player, Tournament } from '../types';

// Type converters
const toPlayer = (row: any): Player => ({
  id: row.id,
  name: row.name,
  currentGameId: row.current_game_id,
  tournamentId: row.tournament_id
});

const toGame = (row: any): Game => ({
  id: row.id,
  board: row.board,
  players: row.players,
  currentTurn: row.current_turn,
  winner: row.winner,
  status: row.status,
  tournamentId: row.tournament_id,
  nextRoundGameId: row.next_round_game_id
});

const toTournament = (row: any): Tournament => ({
  id: row.id,
  name: row.name,
  status: row.status,
  players: row.players,
  games: row.games,
  rounds: row.rounds,
  currentRound: row.current_round,
  winnerId: row.winner_id
});

// Player operations
export async function createPlayer(name: string): Promise<Player> {
  const result = await sql`
    INSERT INTO players (name)
    VALUES (${name})
    RETURNING *
  `;
  return toPlayer(result.rows[0]);
}

export async function getPlayer(id: string): Promise<Player | null> {
  const result = await sql`
    SELECT * FROM players
    WHERE id = ${id}
  `;
  return result.rows[0] ? toPlayer(result.rows[0]) : null;
}

export async function updatePlayer(player: Player): Promise<Player> {
  const result = await sql`
    UPDATE players
    SET name = ${player.name},
        current_game_id = ${player.currentGameId},
        tournament_id = ${player.tournamentId}
    WHERE id = ${player.id}
    RETURNING *
  `;
  return toPlayer(result.rows[0]);
}

// Game operations
export async function createGame(game: Omit<Game, 'id'>): Promise<Game> {
  const result = await sql`
    INSERT INTO games (board, players, current_turn, winner, status, tournament_id, next_round_game_id)
    VALUES (${JSON.stringify(game.board)}, ${JSON.stringify(game.players)}, 
            ${game.currentTurn}, ${game.winner}, ${game.status}, 
            ${game.tournamentId}, ${game.nextRoundGameId})
    RETURNING *
  `;
  return toGame(result.rows[0]);
}

export async function getGame(id: string): Promise<Game | null> {
  const result = await sql`
    SELECT * FROM games
    WHERE id = ${id}
  `;
  return result.rows[0] ? toGame(result.rows[0]) : null;
}

export async function updateGame(game: Game): Promise<Game> {
  const result = await sql`
    UPDATE games
    SET board = ${JSON.stringify(game.board)},
        players = ${JSON.stringify(game.players)},
        current_turn = ${game.currentTurn},
        winner = ${game.winner},
        status = ${game.status},
        tournament_id = ${game.tournamentId},
        next_round_game_id = ${game.nextRoundGameId}
    WHERE id = ${game.id}
    RETURNING *
  `;
  return toGame(result.rows[0]);
}

// Tournament operations
export async function createTournament(tournament: Omit<Tournament, 'id'>): Promise<Tournament> {
  const result = await sql`
    INSERT INTO tournaments (name, status, players, games, rounds, current_round, winner_id)
    VALUES (${tournament.name}, ${tournament.status}, ${JSON.stringify(tournament.players)}, 
            ${JSON.stringify(tournament.games)}, ${tournament.rounds}, ${tournament.currentRound}, 
            ${tournament.winnerId})
    RETURNING *
  `;
  return toTournament(result.rows[0]);
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const result = await sql`
    SELECT * FROM tournaments
    WHERE id = ${id}
  `;
  return result.rows[0] ? toTournament(result.rows[0]) : null;
}

export async function updateTournament(tournament: Tournament): Promise<Tournament> {
  const result = await sql`
    UPDATE tournaments
    SET name = ${tournament.name},
        status = ${tournament.status},
        players = ${JSON.stringify(tournament.players)},
        games = ${JSON.stringify(tournament.games)},
        rounds = ${tournament.rounds},
        current_round = ${tournament.currentRound},
        winner_id = ${tournament.winnerId}
    WHERE id = ${tournament.id}
    RETURNING *
  `;
  return toTournament(result.rows[0]);
}

export async function getActiveTournaments(): Promise<Tournament[]> {
  const result = await sql`
    SELECT * FROM tournaments
    WHERE status != 'completed'
    ORDER BY id DESC
  `;
  return result.rows.map(toTournament);
}

export async function getTournamentGames(tournamentId: string): Promise<Game[]> {
  const result = await sql`
    SELECT * FROM games
    WHERE tournament_id = ${tournamentId}
  `;
  return result.rows.map(toGame);
} 