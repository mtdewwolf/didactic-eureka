import React, { useEffect, useState } from 'react';
import { Tournament as TournamentType, Game, Player } from '@/types';
import { useSocket } from '@/contexts/SocketContext';
import GameBoard from './GameBoard';

interface TournamentProps {
  tournamentId: string;
  currentPlayer: Player;
}

const Tournament: React.FC<TournamentProps> = ({ tournamentId, currentPlayer }) => {
  const { joinTournament, leaveTournament } = useSocket();
  const [tournament, setTournament] = useState<TournamentType | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [currentPlayerGame, setCurrentPlayerGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tournament data and listen for updates
  useEffect(() => {
    const fetchTournament = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tournament');
        }
        
        setTournament(data.tournament);
        setGames(data.games);
        
        // Find the current player's game if they are in one
        const playerGame = data.games.find((game: Game) => 
          (game.players.x === currentPlayer.id || game.players.o === currentPlayer.id) &&
          (game.status === 'waiting' || game.status === 'inProgress')
        );
        
        setCurrentPlayerGame(playerGame || null);
      } catch (err: unknown) {
        console.error('Error fetching tournament:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournament();
    
    // Join the tournament socket room
    joinTournament(tournamentId, currentPlayer.id);
    
    // Cleanup on unmount
    return () => {
      leaveTournament(tournamentId, currentPlayer.id);
    };
  }, [tournamentId, currentPlayer.id, joinTournament, leaveTournament]);

  // Start or advance the tournament
  const handleStartOrAdvance = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to advance tournament');
      }
      
      setTournament(data.tournament);
      
      // Add new games to the games list
      if (data.newGames && data.newGames.length > 0) {
        setGames(prevGames => [...prevGames, ...data.newGames]);
        
        // Check if the current player is in any of the new games
        const playerGame = data.newGames.find((game: Game) => 
          game.players.x === currentPlayer.id || game.players.o === currentPlayer.id
        );
        
        if (playerGame) {
          setCurrentPlayerGame(playerGame);
        }
      }
    } catch (err: unknown) {
      console.error('Error advancing tournament:', err);
      alert(err instanceof Error ? err.message : 'Failed to advance tournament');
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading tournament...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!tournament) {
    return <div className="text-center p-8">Tournament not found</div>;
  }

  // Group games by round
  const gamesByRound: { [key: number]: Game[] } = {};
  games.forEach(game => {
    const round = game.nextRoundGameId ? tournament.currentRound - 1 : tournament.currentRound;
    if (!gamesByRound[round]) {
      gamesByRound[round] = [];
    }
    gamesByRound[round].push(game);
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-2">{tournament.name}</h1>
      <p className="text-center text-gray-600 mb-6">
        Status: {tournament.status} | Round: {tournament.currentRound + 1} of {tournament.rounds}
      </p>
      
      {/* Tournament controls */}
      {(tournament.status === 'registering' || 
        (tournament.status === 'inProgress' && 
         games.every(g => g.status === 'completed' || g.status === 'abandoned'))) && (
        <div className="text-center mb-8">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleStartOrAdvance}
          >
            {tournament.status === 'registering' ? 'Start Tournament' : 'Advance to Next Round'}
          </button>
        </div>
      )}
      
      {/* Current player's game */}
      {currentPlayerGame && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold text-center mb-4">Your Current Game</h2>
          <GameBoard game={currentPlayerGame} currentPlayer={currentPlayer} />
        </div>
      )}
      
      {/* Tournament bracket visualization */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-center mb-4">Tournament Bracket</h2>
        
        {Object.keys(gamesByRound).map(roundKey => {
          const round = parseInt(roundKey);
          return (
            <div key={round} className="mb-8">
              <h3 className="text-lg font-medium mb-2">Round {round + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gamesByRound[round].map(game => (
                  <div
                    key={game.id}
                    className="p-3 border rounded-md bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">Game {game.id.substring(0, 6)}</div>
                      <div className={`
                        text-sm px-2 py-1 rounded-full
                        ${game.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
                          game.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : 
                          game.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}
                      `}>
                        {game.status}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <div>Player X</div>
                      <div className={game.winner === game.players.x ? 'font-bold' : ''}>
                        {game.players.x.substring(0, 6)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center py-1">
                      <div>Player O</div>
                      <div className={game.winner === game.players.o ? 'font-bold' : ''}>
                        {game.players.o.substring(0, 6)}
                      </div>
                    </div>
                    
                    {game.winner && (
                      <div className="mt-2 text-green-600 font-medium">
                        Winner: {game.winner.substring(0, 6)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Winner display */}
      {tournament.status === 'completed' && tournament.winnerId && (
        <div className="mt-8 text-center p-4 bg-green-100 rounded-lg">
          <h2 className="text-xl font-bold text-green-800">
            Tournament Champion: {tournament.winnerId === currentPlayer.id ? 'YOU!' : tournament.winnerId.substring(0, 8)}
          </h2>
        </div>
      )}
    </div>
  );
};

export default Tournament; 