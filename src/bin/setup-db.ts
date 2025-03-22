#!/usr/bin/env node
import {
  createPlayer,
  createGame,
  createTournament
} from '../lib/db';
import { createEmptyBoard } from '../lib/game-utils';

// File to set up the database with initial data for development

async function setupDatabase() {
  console.log('Setting up database...');

  // Create players
  console.log('Creating players...');
  const player1 = await createPlayer('Player 1');
  const player2 = await createPlayer('Player 2');
  const player3 = await createPlayer('Player 3');
  const player4 = await createPlayer('Player 4');

  console.log('Created players:', {
    player1: player1.id,
    player2: player2.id,
    player3: player3.id, 
    player4: player4.id
  });

  // Create a game
  console.log('Creating game...');
  const game = await createGame({
    board: createEmptyBoard(),
    players: {
      x: player1.id,
      o: player2.id
    },
    currentTurn: 'x',
    winner: null,
    status: 'waiting',
    tournamentId: undefined,
    nextRoundGameId: undefined
  });

  console.log('Created game:', game.id);

  // Create a tournament
  console.log('Creating tournament...');
  const tournament = await createTournament({
    name: 'Tournament 1',
    status: 'registering',
    players: [player1.id, player2.id, player3.id, player4.id],
    games: [],
    rounds: 2,
    currentRound: 0,
    winnerId: null
  });

  console.log('Created tournament:', tournament.id);

  console.log('Database setup complete!');
}

setupDatabase().catch(console.error); 