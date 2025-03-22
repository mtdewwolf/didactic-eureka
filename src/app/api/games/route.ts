import { NextRequest, NextResponse } from 'next/server';
import { createGame as dbCreateGame, getPlayer } from '@/lib/db';
import { createNewGame } from '@/lib/game-utils';

// Create a new game
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { player1Id, player2Id, tournamentId } = data;
    
    if (!player1Id || !player2Id) {
      return NextResponse.json(
        { success: false, error: 'Both player IDs are required' },
        { status: 400 }
      );
    }
    
    // Get players from the database
    const player1 = await getPlayer(player1Id);
    const player2 = await getPlayer(player2Id);
    
    if (!player1 || !player2) {
      return NextResponse.json(
        { success: false, error: 'One or both players not found' },
        { status: 404 }
      );
    }
    
    // Create the game
    const game = createNewGame(player1, player2, tournamentId);
    const savedGame = await dbCreateGame(game);
    
    return NextResponse.json({ success: true, game: savedGame });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 