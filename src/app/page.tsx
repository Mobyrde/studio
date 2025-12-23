
'use client';

import React, { useState } from 'react';
import SlitherGame from '@/components/slither-game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DamnBruhPage = () => {
  const [lobby, setLobby] = useState<number | null>(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleLobbySelect = (amount: number) => {
    setLobby(amount);
  };

  const handleJoinGame = () => {
    if (lobby !== null) {
      setGameOver(false);
      setGameStarted(true);
    }
  };
  
  const handleGameOver = () => {
    setGameStarted(false);
    setGameOver(true);
  }
  
  const handlePlayAgain = () => {
    setGameOver(false);
    setGameStarted(false); 
    setLobby(1);
  };

  if (gameStarted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <SlitherGame onGameOver={handleGameOver} lobby={lobby!} />
      </main>
    );
  }

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-black"
      style={{
        perspective: '1000px',
      }}
    >
      <div className="text-center">
        <h1
          className="text-7xl md:text-9xl font-bold text-white select-none"
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            color: '#f0f0f0',
            textShadow: `
              0px 1px 0px #c0c0c0,
              0px 2px 0px #b0b0b0,
              0px 3px 0px #a0a0a0,
              0px 4px 0px #909090,
              0px 5px 0px #808080,
              0px 6px 0px #707070,
              0px 7px 0px #606060,
              0px 8px 10px rgba(0,0,0,0.5)
            `,
            transform: 'rotateX(20deg) rotateY(-5deg)',
            letterSpacing: '0.1em',
          }}
        >
          {gameOver ? 'GAME OVER' : 'NEON SLITHER'}
        </h1>
        <div className="mt-12 flex flex-col items-center gap-6">
            {!gameOver && (
                <>
                    <div className="flex justify-center gap-4">
                        {[1, 5, 20].map((amount) => (
                        <Button
                            key={amount}
                            onClick={() => handleLobbySelect(amount)}
                            className={cn(
                            "bg-transparent border-2 text-xl font-bold py-6 px-8 rounded-lg transition-all duration-300 transform hover:scale-110",
                            lobby === amount
                                ? "border-primary text-primary shadow-[0_0_20px] shadow-primary"
                                : "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                            )}
                        >
                            ${amount}
                        </Button>
                        ))}
                    </div>
                    <Button
                        onClick={handleJoinGame}
                        disabled={lobby === null}
                        className="bg-primary text-primary-foreground text-2xl font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px] shadow-primary/70"
                    >
                        Join Game
                    </Button>
                </>
            )}
            {gameOver && (
                 <Button
                    onClick={handlePlayAgain}
                    className="bg-primary text-primary-foreground text-2xl font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px] shadow-primary/70"
                >
                    Play Again
                </Button>
            )}
        </div>
      </div>
    </main>
  );
};

export default DamnBruhPage;
