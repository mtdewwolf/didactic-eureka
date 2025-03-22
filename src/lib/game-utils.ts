import { v4 as uuidv4 } from 'uuid';
import { Board, Game, GameMove, Player, Tournament } from '../types';

// Create an empty board
export function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
}

// Check if a move is valid
export function isValidMove(game: Game, move: GameMove): boolean {
  // Check if it's the player's turn
  const playerSymbol = game.players.x === move.playerId ? 'x' : 'o';
  if (game.currentTurn !== playerSymbol) {
    return false;
  }

  // Check if the position is valid and empty
  const [row, col] = move.position;
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return false;
  }
  
  return game.board[row][col] === null;
}

// Apply a move to the game
export function applyMove(game: Game, move: GameMove): Game {
  const playerSymbol = game.players.x === move.playerId ? 'x' : 'o';
  const [row, col] = move.position;
  
  // Create a new board with the move applied
  const newBoard = game.board.map((boardRow, rowIndex) => 
    boardRow.map((cell, colIndex) => 
      rowIndex === row && colIndex === col ? playerSymbol : cell
    )
  );
  
  // Update the current turn
  const newTurn = playerSymbol === 'x' ? 'o' : 'x';
  
  // Check for a winner or draw
  const winner = checkWinner(newBoard);
  let status = game.status;
  
  if (winner) {
    status = 'completed';
  } else if (isBoardFull(newBoard)) {
    status = 'completed';
  }
  
  return {
    ...game,
    board: newBoard,
    currentTurn: newTurn,
    winner: winner === 'x' ? game.players.x : winner === 'o' ? game.players.o : null,
    status
  };
}

// Check if the board is full (draw)
export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Check for a winner
export function checkWinner(board: Board): 'x' | 'o' | null {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return board[i][0] as 'x' | 'o';
    }
  }
  
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return board[0][i] as 'x' | 'o';
    }
  }
  
  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return board[0][0] as 'x' | 'o';
  }
  
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return board[0][2] as 'x' | 'o';
  }
  
  return null;
}

// Create a new game
export function createNewGame(player1: Player, player2: Player, tournamentId?: string): Game {
  // Randomly decide who goes first
  const randomFirst = Math.random() < 0.5;

  return {
    id: uuidv4(),
    board: createEmptyBoard(),
    players: {
      x: randomFirst ? player1.id : player2.id,
      o: randomFirst ? player2.id : player1.id
    },
    currentTurn: 'x',
    winner: null,
    status: 'waiting',
    tournamentId
  };
}

// Create a tournament with the given players
export function createTournament(name: string, players: Player[]): Tournament {
  // Shuffle players randomly
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const playerIds = shuffledPlayers.map(player => player.id);
  
  // Calculate number of rounds needed
  const rounds = Math.ceil(Math.log2(players.length));
  
  return {
    id: uuidv4(),
    name,
    status: 'registering',
    players: playerIds,
    games: [],
    rounds,
    currentRound: 0,
    winnerId: null
  };
}

// Generate next round matches for a tournament
export function generateNextRoundMatches(tournament: Tournament, games: Game[]): { tournament: Tournament, newGames: Game[] } {
  // If tournament is complete, return as is
  if (tournament.status === 'completed') {
    return { tournament, newGames: [] };
  }
  
  const winners: string[] = [];
  const newGames: Game[] = [];
  const updatedTournament = { ...tournament };
  
  if (tournament.currentRound === 0) {
    // First round - match players
    const playerIds = [...tournament.players];
    
    // Add a bye for odd number of players
    if (playerIds.length % 2 !== 0) {
      playerIds.push('bye');
    }
    
    for (let i = 0; i < playerIds.length; i += 2) {
      if (i + 1 >= playerIds.length) continue;
      
      const player1Id = playerIds[i];
      const player2Id = playerIds[i + 1];
      
      // If one player is a bye, the other wins automatically
      if (player1Id === 'bye') {
        winners.push(player2Id);
        continue;
      }
      
      if (player2Id === 'bye') {
        winners.push(player1Id);
        continue;
      }
      
      // Create a new game between the players
      const game: Game = {
        id: uuidv4(),
        board: createEmptyBoard(),
        players: {
          x: player1Id,
          o: player2Id
        },
        currentTurn: 'x',
        winner: null,
        status: 'waiting',
        tournamentId: tournament.id
      };
      
      newGames.push(game);
    }
  } else {
    // Subsequent rounds - match winners from previous round
    const prevRoundGames = games.filter(g => 
      g.tournamentId === tournament.id && 
      g.status === 'completed'
    );
    
    const prevRoundWinners = prevRoundGames
      .filter(g => g.winner !== null)
      .map(g => g.winner as string);
    
    for (let i = 0; i < prevRoundWinners.length; i += 2) {
      if (i + 1 >= prevRoundWinners.length) {
        // If there's an odd number of winners, the last one gets a bye
        winners.push(prevRoundWinners[i]);
        continue;
      }
      
      const player1Id = prevRoundWinners[i];
      const player2Id = prevRoundWinners[i + 1];
      
      // Create a new game between the winners
      const game: Game = {
        id: uuidv4(),
        board: createEmptyBoard(),
        players: {
          x: player1Id,
          o: player2Id
        },
        currentTurn: 'x',
        winner: null,
        status: 'waiting',
        tournamentId: tournament.id
      };
      
      newGames.push(game);
    }
  }
  
  // If there's only one winner, tournament is complete
  if (newGames.length === 0 && winners.length === 1) {
    updatedTournament.status = 'completed';
    updatedTournament.winnerId = winners[0];
  } else {
    updatedTournament.currentRound++;
    updatedTournament.games = [...tournament.games, ...newGames.map(g => g.id)];
  }
  
  return { tournament: updatedTournament, newGames };
} 