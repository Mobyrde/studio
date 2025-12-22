
'use client';

import { useState } from 'react';
import SlitherGame from '@/components/slither-game';
import { Button } from '@/components/ui/button';

const AsciiArt = () => (
  <pre className="text-sm md:text-base text-green-400 font-mono">
    {`
    ░█▀▀█ ░█▀▀▀█ ░█▀▀█ ▀▀█▀▀ ░█▀▀▀ ░█▀▀▄ 
    ░█▄▄█ ░█──░█ ░█▄▄▀ ─░█── ░█▀▀▀ ░█─░█ 
    ░█─── ░█▄▄▄█ ░█─░█ ─░█── ░█▄▄▄ ░█▀▀─
    
    ░█▀▀▀ ░█─── ░█▀▀▀█ ▀█▀ ░█▀▀▀█ ░█▀▀█ ░█▀▀▀
    ░█▀▀▀ ░█─── ─▀▀▀▄▄ ░█─ ░█──░█ ░█▄▄█ ░█▀▀▀ 
    ░█▄▄▄ ░█▄▄█ ░█▄▄▄█ ▄█▄ ░█▄▄▄█ ░█─── ░█▄▄▄
    `}
  </pre>
);

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleGameOver = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <main 
        className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-green-400 font-mono"
        style={{ textShadow: '0 0 5px #0f0, 0 0 10px #0f0' }}
      >
        <div className="absolute inset-0 bg-black opacity-75 z-0"></div>
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 2px, 3px 100%',
            pointerEvents: 'none'
          }}
        ></div>
        
        <div className="z-10 text-center animate-pulse">
          <AsciiArt />
          <h1 className="text-3xl md:text-5xl font-bold tracking-widest my-8">
            NEON SLITHER
          </h1>
          <Button
            onClick={() => setGameStarted(true)}
            variant="outline"
            className="bg-transparent text-green-400 border-green-400 hover:bg-green-400 hover:text-black transition-all duration-300 text-lg md:text-xl px-8 py-6"
          >
            &gt; Start Game
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary mb-4 tracking-widest animate-pulse" style={{textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))'}}>
        NEON SLITHER
      </h1>
      <SlitherGame onGameOver={handleGameOver} />
    </main>
  );
}
