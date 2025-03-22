'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import LoginForm from '@/components/LoginForm';
import { Tournament as TournamentType } from '@/types';
import Tournament from '@/components/Tournament';

export default function Home() {
  const { player, logout } = usePlayer();
  const [tournaments, setTournaments] = useState<TournamentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [tournamentName, setTournamentName] = useState('');
  const [playerNames, setPlayerNames] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch active tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      if (!player) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/tournaments');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tournaments');
        }
        
        setTournaments(data.tournaments);
      } catch (err: any) {
        console.error('Error fetching tournaments:', err);
        setError(err.message || 'Failed to fetch tournaments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournaments();
  }, [player]);

  // Create a new tournament
  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tournamentName.trim() || !playerNames.trim()) {
      setError('Tournament name and player names are required');
      return;
    }
    
    const playerList = playerNames.split(',').map(name => name.trim()).filter(Boolean);
    
    if (playerList.length < 2) {
      setError('At least 2 players are required for a tournament');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: tournamentName,
          players: [...playerList, player?.name]
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tournament');
      }
      
      // Add the new tournament to the list
      setTournaments(prev => [data.tournament, ...prev]);
      
      // Reset form
      setTournamentName('');
      setPlayerNames('');
      setShowCreateForm(false);
      
      // Select the new tournament
      setSelectedTournament(data.tournament.id);
    } catch (err: any) {
      console.error('Error creating tournament:', err);
      setError(err.message || 'Failed to create tournament');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setSelectedTournament(null);
    logout();
  };

  if (!player) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Tournament Tic-Tac-Toe</h1>
          <LoginForm />
        </div>
      </main>
    );
  }

  if (selectedTournament) {
    return (
      <main className="min-h-screen p-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Tournament Tic-Tac-Toe</h1>
            <div>
              <button
                className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                onClick={() => setSelectedTournament(null)}
              >
                Back to Tournaments
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
          
          <Tournament tournamentId={selectedTournament} currentPlayer={player} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tournament Tic-Tac-Toe</h1>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {player.name}</span>
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          {showCreateForm ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
              <form onSubmit={handleCreateTournament}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Tournament Name</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Enter tournament name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Player Names (comma separated)
                  </label>
                  <textarea
                    value={playerNames}
                    onChange={(e) => setPlayerNames(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Enter player names separated by commas"
                    rows={3}
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Note: You will automatically be added as a player
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 mr-2 text-gray-600"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Tournament'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setShowCreateForm(true)}
            >
              Create New Tournament
            </button>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Tournaments</h2>
          
          {isLoading ? (
            <div className="text-center p-8">Loading tournaments...</div>
          ) : tournaments.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-gray-600">No active tournaments found</p>
              <p className="text-gray-600 mt-2">Create a new tournament to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTournament(tournament.id)}
                >
                  <h3 className="text-lg font-semibold mb-2">{tournament.name}</h3>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Players: {tournament.players.length}</span>
                    <span>Round: {tournament.currentRound + 1}/{tournament.rounds}</span>
                  </div>
                  <div className={`
                    inline-block px-2 py-1 rounded-full text-xs
                    ${tournament.status === 'registering' ? 'bg-yellow-100 text-yellow-800' : 
                      tournament.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {tournament.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
