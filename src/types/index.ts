export type Player = {
  id: string;
  name: string;
  currentGameId?: string;
  tournamentId?: string;
};

export type GameStatus = 'waiting' | 'inProgress' | 'completed' | 'abandoned';

export type Board = Array<Array<string | null>>;

export type Game = {
  id: string;
  board: Board;
  players: {
    x: string; // player ID
    o: string; // player ID
  };
  currentTurn: 'x' | 'o';
  winner: string | null;
  status: GameStatus;
  tournamentId?: string;
  nextRoundGameId?: string;
};

export type TournamentStatus = 'registering' | 'inProgress' | 'completed';

export type Tournament = {
  id: string;
  name: string;
  status: TournamentStatus;
  players: string[]; // array of player IDs
  games: string[]; // array of game IDs
  rounds: number;
  currentRound: number;
  winnerId: string | null;
};

export type GameMove = {
  gameId: string;
  playerId: string;
  position: [number, number]; // [row, col]
}; 