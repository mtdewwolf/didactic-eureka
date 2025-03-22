import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGame } from '@/lib/db';
import { applyMove } from '@/lib/game-utils';
import { GameMove } from '@/types';

// Get game by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const game = await getGame(id);
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// Make a move in the game
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { playerId, position } = data;
    
    if (!playerId || !position || !Array.isArray(position) || position.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid move data' },
        { status: 400 }
      );
    }
    
    // Get the game
    const game = await getGame(id);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Check if game is active
    if (game.status !== 'waiting' && game.status !== 'inProgress') {
      return NextResponse.json(
        { success: false, error: 'Game is not active' },
        { status: 400 }
      );
    }
    
    // Check if player is part of the game
    if (game.players.x !== playerId && game.players.o !== playerId) {
      return NextResponse.json(
        { success: false, error: 'Player is not part of this game' },
        { status: 403 }
      );
    }
    
    // Create the move
    const move: GameMove = {
      gameId: id,
      playerId,
      position: [position[0], position[1]]
    };
    
    // If game was waiting, set it to in progress
    let updatedGame = game;
    if (game.status === 'waiting') {
      updatedGame = {
        ...game,
        status: 'inProgress'
      };
    }
    
    // Apply the move
    updatedGame = applyMove(updatedGame, move);
    
    // Save the updated game
    const savedGame = await updateGame(updatedGame);
    
    return NextResponse.json({ success: true, game: savedGame });
  } catch (error) {
    console.error('Error making move:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to make move' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 