import { NextRequest, NextResponse } from 'next/server';
import { createGame, getTournament, getTournamentGames, updateTournament } from '@/lib/db';
import { generateNextRoundMatches } from '@/lib/game-utils';
import { Game } from '@/types';

type Params = {
  params: {
    id: string;
  };
};

// Get tournament by ID with games
export async function GET(
  request: NextRequest,
  params: Params
) {
  try {
    const { id } = params.params;
    const tournament = await getTournament(id);
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    const games = await getTournamentGames(id);
    
    return NextResponse.json({ 
      success: true, 
      tournament,
      games
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}

// Start or advance tournament
export async function POST(
  request: NextRequest,
  params: Params
) {
  try {
    const { id } = params.params;
    const tournament = await getTournament(id);
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    if (tournament.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Tournament is already completed' },
        { status: 400 }
      );
    }
    
    // If tournament is in registering state, change to in progress
    if (tournament.status === 'registering') {
      tournament.status = 'inProgress';
    }
    
    // Get existing games for the tournament
    const existingGames = await getTournamentGames(id);
    
    // Generate matches for the next round
    const { tournament: updatedTournament, newGames } = generateNextRoundMatches(tournament, existingGames);
    
    // Save the updated tournament
    await updateTournament(updatedTournament);
    
    // Save all new games
    const savedGames: Game[] = [];
    for (const game of newGames) {
      const savedGame = await createGame(game);
      savedGames.push(savedGame);
    }
    
    return NextResponse.json({ 
      success: true, 
      tournament: updatedTournament,
      newGames: savedGames
    });
  } catch (error) {
    console.error('Error advancing tournament:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to advance tournament' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 