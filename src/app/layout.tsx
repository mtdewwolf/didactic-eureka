import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SocketProvider } from "@/contexts/SocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tournament Tic-tac-toe",
  description: "A multiplayer tournament-style Tic-tac-toe game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PlayerProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
