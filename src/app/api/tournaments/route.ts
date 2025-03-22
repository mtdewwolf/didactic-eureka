import { NextRequest, NextResponse } from 'next/server';
import { createPlayer, createTournament as dbCreateTournament, getActiveTournaments, getTournament, getTournamentGames, updateTournament } from '@/lib/db';
import { createTournament, generateNextRoundMatches } from '@/lib/game-utils';
import { Player, Tournament } from '@/types';

// Get all active tournaments
export async function GET(request: NextRequest) {
  try {
    const tournaments = await getActiveTournaments();
    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

// Create a new tournament
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, players } = data;
    
    if (!name || !players || !Array.isArray(players) || players.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid tournament data' },
        { status: 400 }
      );
    }
    
    // Create players in the database or get existing ones
    const createdPlayers: Player[] = [];
    for (const playerName of players) {
      const player = await createPlayer(playerName);
      createdPlayers.push(player);
    }
    
    // Create the tournament
    const tournament = createTournament(name, createdPlayers);
    const savedTournament = await dbCreateTournament(tournament);
    
    return NextResponse.json({ success: true, tournament: savedTournament });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 