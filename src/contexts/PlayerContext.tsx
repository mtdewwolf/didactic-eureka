'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player } from '@/types';

interface PlayerContextType {
  player: Player | null;
  isLoading: boolean;
  error: string | null;
  login: (name: string) => Promise<void>;
  logout: () => void;
}

const PlayerContext = createContext<PlayerContextType>({
  player: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: () => {}
});

export const usePlayer = () => useContext(PlayerContext);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load player from localStorage on initial render
  useEffect(() => {
    const storedPlayer = localStorage.getItem('tictactoe_player');
    if (storedPlayer) {
      try {
        setPlayer(JSON.parse(storedPlayer));
      } catch (err) {
        console.error('Failed to parse stored player:', err);
        localStorage.removeItem('tictactoe_player');
      }
    }
  }, []);

  // Login - create a new player or fetch existing one
  const login = async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to create a player
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      // Set the player in state and localStorage
      setPlayer(data.player);
      localStorage.setItem('tictactoe_player', JSON.stringify(data.player));
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout - remove player from state and localStorage
  const logout = () => {
    setPlayer(null);
    localStorage.removeItem('tictactoe_player');
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        isLoading,
        error,
        login,
        logout
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}; 