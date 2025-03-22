# Tournament Tic-tac-toe

A multiplayer tournament-style Tic-tac-toe game, built with Next.js and Socket.io. This application allows users to create and participate in Tic-tac-toe tournaments with real-time gameplay.

## Features

- User registration and authentication
- Create and join tournaments
- Automatic tournament bracket generation
- Real-time game play with Socket.io
- Tournament progression tracking
- Mobile-responsive design

## Tech Stack

- Next.js 15.2+
- TypeScript
- Socket.io for real-time communication
- Vercel Postgres for database
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tictactoe.git
   cd tictactoe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   SOCKET_PORT=3001
   POSTGRES_URL="your-postgres-connection-string"
   ```

4. Set up the database:
   Run the schema creation script in your PostgreSQL database:
   ```sql
   -- Import the schema.sql file
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment on Vercel

This application is designed to be deployed on Vercel.

1. Push your code to a GitHub repository
2. Import the project into Vercel
3. Set up the following environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_BASE_URL` (your production URL)
   - `POSTGRES_URL` (your Vercel Postgres connection string)

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/contexts` - React context providers
- `/src/lib` - Utility functions and database operations
- `/src/types` - TypeScript type definitions

## How It Works

1. Users register by entering their name
2. Users can create tournaments or join existing ones
3. Tournament creators can add players and start the tournament
4. The system automatically creates matches and advances players through the bracket
5. Players can see their current games and make moves in real-time
6. Tournament results are tracked and winners are displayed

## License

This project is open source and available under the [MIT License](LICENSE).

### Database Setup

This application uses SQLite for data storage. The database will be automatically created when you run the application, but you can pre-populate it with test data:

```bash
npm run setup-db
```

This will create sample players, games, and tournaments in the database.

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Structure

The application uses a SQLite database with the following tables:

1. **players** - Stores player information
   - id: TEXT (Primary Key)
   - name: TEXT
   - current_game_id: TEXT (Foreign Key to games.id)
   - tournament_id: TEXT (Foreign Key to tournaments.id)

2. **games** - Stores game information
   - id: TEXT (Primary Key)
   - board: TEXT (JSON representing the game board)
   - players: TEXT (JSON with player IDs for 'x' and 'o')
   - current_turn: TEXT ('x' or 'o')
   - winner: TEXT (Player ID of winner, if any)
   - status: TEXT ('waiting', 'inProgress', 'completed', or 'abandoned')
   - tournament_id: TEXT (Foreign Key to tournaments.id)
   - next_round_game_id: TEXT (Foreign Key to games.id)

3. **tournaments** - Stores tournament information
   - id: TEXT (Primary Key)
   - name: TEXT
   - status: TEXT ('registering', 'inProgress', or 'completed')
   - players: TEXT (JSON array of player IDs)
   - games: TEXT (JSON array of game IDs)
   - rounds: INTEGER
   - current_round: INTEGER
   - winner_id: TEXT (Player ID of tournament winner, if any)

## Database Location

The SQLite database is stored in:

- Development: `./data/tictactoe-dev.db`
- Production: `./data/tictactoe.db`

The database files are excluded from Git in the `.gitignore` file.
