'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Game } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinGame: (gameId: string, playerId: string) => void;
  leaveGame: (gameId: string, playerId: string) => void;
  makeMove: (gameId: string, playerId: string, position: [number, number]) => void;
  joinTournament: (tournamentId: string, playerId: string) => void;
  leaveTournament: (tournamentId: string, playerId: string) => void;
  gameState: Game | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  joinGame: () => {},
  leaveGame: () => {},
  makeMove: () => {},
  joinTournament: () => {},
  leaveTournament: () => {},
  gameState: null
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<Game | null>(null);

  useEffect(() => {
    // Get the socket URL from the API
    const initSocket = async () => {
      try {
        const response = await fetch('/api/socket');
        const data = await response.json();
        
        if (data.success && data.socketUrl) {
          const socketInstance = io(data.socketUrl);
          
          socketInstance.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);
          });
          
          socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
          });
          
          socketInstance.on('game-state', (game: Game) => {
            console.log('Received game state:', game);
            setGameState(game);
          });
          
          socketInstance.on('error', (error: any) => {
            console.error('Socket error:', error);
          });
          
          setSocket(socketInstance);
          
          return () => {
            socketInstance.disconnect();
          };
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };
    
    initSocket();
  }, []);

  // Socket event handlers
  const joinGame = (gameId: string, playerId: string) => {
    if (socket && connected) {
      socket.emit('join-game', { gameId, playerId });
    }
  };

  const leaveGame = (gameId: string, playerId: string) => {
    if (socket && connected) {
      socket.emit('leave-game', { gameId, playerId });
      setGameState(null);
    }
  };

  const makeMove = (gameId: string, playerId: string, position: [number, number]) => {
    if (socket && connected) {
      socket.emit('make-move', { gameId, playerId, position });
    }
  };

  const joinTournament = (tournamentId: string, playerId: string) => {
    if (socket && connected) {
      socket.emit('join-tournament', { tournamentId, playerId });
    }
  };

  const leaveTournament = (tournamentId: string, playerId: string) => {
    if (socket && connected) {
      socket.emit('leave-tournament', { tournamentId, playerId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinGame,
        leaveGame,
        makeMove,
        joinTournament,
        leaveTournament,
        gameState
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}; 