import React from 'react';
import { Game, Player } from '@/types';
import { useSocket } from '@/contexts/SocketContext';

interface GameBoardProps {
  game: Game;
  currentPlayer: Player;
}

const GameBoard: React.FC<GameBoardProps> = ({ game, currentPlayer }) => {
  const { makeMove } = useSocket();
  
  // Check if it's the current player's turn
  const isMyTurn = (game.players.x === currentPlayer.id && game.currentTurn === 'x') ||
                   (game.players.o === currentPlayer.id && game.currentTurn === 'o');
  
  // Get player symbol (X or O)
  const mySymbol = game.players.x === currentPlayer.id ? 'x' : 'o';
  
  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Only allow moves if it's the player's turn and the game is active
    if (!isMyTurn || game.status !== 'inProgress') return;
    
    // Check if the cell is empty
    if (game.board[row][col] !== null) return;
    
    // Make the move
    makeMove(game.id, currentPlayer.id, [row, col]);
  };
  
  // Get game status message
  const getStatusMessage = () => {
    if (game.status === 'waiting') {
      return 'Waiting for game to start...';
    }
    
    if (game.status === 'inProgress') {
      return isMyTurn ? 'Your turn' : "Opponent's turn";
    }
    
    if (game.status === 'completed') {
      if (game.winner === currentPlayer.id) {
        return 'You won!';
      } else if (game.winner === null) {
        return 'Game ended in a draw';
      } else {
        return 'You lost';
      }
    }
    
    if (game.status === 'abandoned') {
      return 'Game was abandoned';
    }
    
    return '';
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Game: {game.id.substring(0, 8)}</h2>
        <p className="text-gray-600">
          You are playing as <span className="font-bold">{mySymbol.toUpperCase()}</span>
        </p>
        <p className="text-lg mt-2">{getStatusMessage()}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {game.board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-full aspect-square text-4xl font-bold flex items-center justify-center 
                ${cell === null && isMyTurn && game.status === 'inProgress' 
                  ? 'bg-gray-200 hover:bg-gray-300' 
                  : 'bg-gray-100'}
                ${game.status === 'completed' && game.winner !== null 
                  ? 'cursor-not-allowed' 
                  : ''}
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={cell !== null || !isMyTurn || game.status !== 'inProgress'}
            >
              {cell === 'x' ? 'X' : cell === 'o' ? 'O' : ''}
            </button>
          ))
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 