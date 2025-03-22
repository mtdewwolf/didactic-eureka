import { NextRequest, NextResponse } from 'next/server';
import { createServer } from 'http';
import { initSocketServer } from '@/lib/socket-server';

// Create an HTTP server instance for Socket.io
const httpServer = createServer();
initSocketServer(httpServer);

// Start the server on a specific port (for development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = parseInt(process.env.SOCKET_PORT || '3001', 10);
  httpServer.listen(PORT, () => {
    console.log(`Socket.io server listening on port ${PORT}`);
  });
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Socket.io server is running',
    socketUrl: process.env.NODE_ENV !== 'production' 
      ? `http://localhost:${process.env.SOCKET_PORT || '3001'}`
      : process.env.NEXT_PUBLIC_BASE_URL
  });
}

export const dynamic = 'force-dynamic'; 