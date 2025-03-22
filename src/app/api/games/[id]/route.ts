import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGame } from '@/lib/db';
import { applyMove, isValidMove } from '@/lib/game-utils';
import { GameMove, GameStatus } from '@/types';

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
    
    return NextResponse.json({ 
      success: true, 
      game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}

// Make a move in a game
export async function POST(
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
    
    // Parse the move data
    const moveData = await request.json();
    const { playerId, position } = moveData;
    
    if (!playerId || !position) {
      return NextResponse.json(
        { success: false, error: 'Invalid move data' },
        { status: 400 }
      );
    }
    
    // Check if the game is active
    if (game.status !== 'inProgress' && game.status !== 'waiting') {
      return NextResponse.json(
        { success: false, error: `Game is ${game.status}` },
        { status: 400 }
      );
    }
    
    // Check if the player is part of the game
    if (playerId !== game.players.x && playerId !== game.players.o) {
      return NextResponse.json(
        { success: false, error: 'Player is not part of this game' },
        { status: 403 }
      );
    }
    
    // Create the move
    const move: GameMove = {
      gameId: id,
      playerId,
      position
    };
    
    // Check if the move is valid
    if (!isValidMove(game, move)) {
      return NextResponse.json(
        { success: false, error: 'Invalid move' },
        { status: 400 }
      );
    }
    
    // If game was waiting, set it to in progress
    let updatedGame = { ...game };
    if (game.status === 'waiting') {
      updatedGame = {
        ...game,
        status: 'inProgress' as GameStatus
      };
    }
    
    // Apply the move
    updatedGame = applyMove(updatedGame, move);
    
    // Save the updated game
    const savedGame = await updateGame(updatedGame);
    
    return NextResponse.json({ 
      success: true, 
      game: savedGame
    });
  } catch (error) {
    console.error('Error making move:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to make move' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 