import { sql } from '@vercel/postgres';
import { Game, Player, Tournament } from '../types';
import { QueryResultRow } from '@vercel/postgres';

// Type converters - using QueryResultRow type
const toPlayer = (row: QueryResultRow): Player => ({
  id: row.id as string,
  name: row.name as string,
  currentGameId: row.current_game_id as string | undefined,
  tournamentId: row.tournament_id as string | undefined
});

const toGame = (row: QueryResultRow): Game => ({
  id: row.id as string,
  board: row.board as Game['board'],
  players: row.players as Game['players'],
  currentTurn: row.current_turn as 'x' | 'o',
  winner: row.winner as string | null,
  status: row.status as Game['status'],
  tournamentId: row.tournament_id as string | undefined,
  nextRoundGameId: row.next_round_game_id as string | undefined
});

const toTournament = (row: QueryResultRow): Tournament => ({
  id: row.id as string,
  name: row.name as string,
  status: row.status as Tournament['status'],
  players: row.players as string[],
  games: row.games as string[],
  rounds: row.rounds as number,
  currentRound: row.current_round as number,
  winnerId: row.winner_id as string | null
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