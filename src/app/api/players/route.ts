import { NextRequest, NextResponse } from 'next/server';
import { createPlayer } from '@/lib/db';

// Create a new player
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name } = data;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }
    
    // Create the player
    const player = await createPlayer(name);
    
    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 