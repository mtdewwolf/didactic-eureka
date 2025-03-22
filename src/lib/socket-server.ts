import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { GameMove, GameStatus } from '../types';
import { applyMove, isValidMove } from './game-utils';
import { getGame, getPlayer, updateGame, updatePlayer } from './db';

// Socket.io server for real-time communication
export function initSocketServer(httpServer: HTTPServer) {
  const io = new IOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket connection logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Player joins a game
    socket.on('join-game', async (data: { gameId: string; playerId: string }) => {
      const { gameId, playerId } = data;
      
      // Join the game's room
      socket.join(`game:${gameId}`);
      console.log(`Player ${playerId} joined game ${gameId}`);
      
      // Update player status
      const player = await getPlayer(playerId);
      if (player) {
        await updatePlayer({
          ...player,
          currentGameId: gameId
        });
      }
      
      // Notify other players
      socket.to(`game:${gameId}`).emit('player-joined', { playerId });
      
      // Fetch and send the current game state
      const game = await getGame(gameId);
      if (game) {
        io.to(`game:${gameId}`).emit('game-state', game);
      }
    });
    
    // Player leaves a game
    socket.on('leave-game', async (data: { gameId: string; playerId: string }) => {
      const { gameId, playerId } = data;
      
      // Leave the game's room
      socket.leave(`game:${gameId}`);
      console.log(`Player ${playerId} left game ${gameId}`);
      
      // Update player status
      const player = await getPlayer(playerId);
      if (player && player.currentGameId === gameId) {
        await updatePlayer({
          ...player,
          currentGameId: undefined
        });
      }
      
      // Notify other players
      socket.to(`game:${gameId}`).emit('player-left', { playerId });
      
      // Update game status if needed
      const game = await getGame(gameId);
      if (game && game.status === 'inProgress') {
        const updatedGame = {
          ...game,
          status: 'abandoned' as GameStatus
        };
        await updateGame(updatedGame);
        io.to(`game:${gameId}`).emit('game-state', updatedGame);
      }
    });
    
    // Player makes a move
    socket.on('make-move', async (move: GameMove) => {
      const { gameId } = move;
      
      // Validate and process the move
      const game = await getGame(gameId);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      if (game.status !== 'inProgress' && game.status !== 'waiting') {
        socket.emit('error', { message: 'Game is not active' });
        return;
      }
      
      if (!isValidMove(game, move)) {
        socket.emit('error', { message: 'Invalid move' });
        return;
      }
      
      // If game was waiting, set it to in progress
      let updatedGame = game;
      if (game.status === 'waiting') {
        updatedGame = {
          ...game,
          status: 'inProgress' as GameStatus
        };
      }
      
      // Apply the move
      updatedGame = applyMove(updatedGame, move);
      
      // Save the updated game state
      await updateGame(updatedGame);
      
      // Broadcast the new game state
      io.to(`game:${gameId}`).emit('game-state', updatedGame);
      
      // If game is completed, handle tournament progression
      if (updatedGame.status === 'completed' && updatedGame.tournamentId) {
        io.to(`tournament:${updatedGame.tournamentId}`).emit('game-completed', {
          gameId: updatedGame.id,
          winnerId: updatedGame.winner
        });
      }
    });
    
    // Player joins a tournament
    socket.on('join-tournament', (data: { tournamentId: string; playerId: string }) => {
      const { tournamentId, playerId } = data;
      
      // Join the tournament's room
      socket.join(`tournament:${tournamentId}`);
      console.log(`Player ${playerId} joined tournament ${tournamentId}`);
      
      // Notify other players
      socket.to(`tournament:${tournamentId}`).emit('player-joined-tournament', { playerId });
    });
    
    // Player leaves a tournament
    socket.on('leave-tournament', (data: { tournamentId: string; playerId: string }) => {
      const { tournamentId, playerId } = data;
      
      // Leave the tournament's room
      socket.leave(`tournament:${tournamentId}`);
      console.log(`Player ${playerId} left tournament ${tournamentId}`);
      
      // Notify other players
      socket.to(`tournament:${tournamentId}`).emit('player-left-tournament', { playerId });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
  return io;
}

// For Next.js API routes compatibility
export const socketIOMiddleware = (
  req: NextApiRequest & { socket: { server: Record<string, unknown> } }, 
  res: NextApiResponse, 
  next: () => void
) => {
  if (!req.socket.server.io) {
    const httpServer = req.socket.server as unknown as HTTPServer;
    req.socket.server.io = initSocketServer(httpServer);
  }
  next();
}; 