
'use client';

import React, { useState } from 'react';
import SlitherGame from '@/components/slither-game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Server = {
    name: string;
    amount: number;
}

const SERVERS: Server[] = [
    { name: 'Server 1', amount: 1 },
    { name: 'Server 2', amount: 5 },
    { name: 'Server 3', amount: 20 },
]

const DamnBruhPage = () => {
  const [selectedServer, setSelectedServer] = useState<Server>(SERVERS[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLobbySelect = (server: Server) => {
    setSelectedServer(server);
  };

  const handleJoinGame = () => {
    if (selectedServer) {
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
    setSelectedServer(SERVERS[0]);
    setPlayerName('');
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);

        const balanceHex = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
        const balanceInWei = BigInt(balanceHex);
        const balanceInEth = Number(balanceInWei) / 1e18;
        setWalletBalance(balanceInEth.toFixed(4));

        toast({
          title: "Wallet Connected",
          description: `Connected with address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      } catch (error) {
        console.error("Wallet connection failed:", error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not connect to the wallet. Please try again.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "No Wallet Detected",
        description: "Please install a wallet like MetaMask or Trust Wallet.",
      });
    }
  };


  if (gameStarted) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <SlitherGame onGameOver={handleGameOver} server={selectedServer} playerName={playerName} />
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
                    <Input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-80 bg-transparent text-center text-xl font-bold text-white border-2 border-muted-foreground focus:border-primary focus:ring-primary focus:shadow-[0_0_20px] focus:shadow-primary transition-all duration-300"
                    />
                    <div className="flex justify-center gap-4">
                        {SERVERS.map((server) => (
                        <Button
                            key={server.name}
                            onClick={() => handleLobbySelect(server)}
                            className={cn(
                            "bg-transparent border-2 text-xl font-bold py-6 px-8 rounded-lg transition-all duration-300 transform hover:scale-110",
                            selectedServer.name === server.name
                                ? "border-primary text-primary shadow-[0_0_20px] shadow-primary"
                                : "border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                            )}
                        >
                            ${server.amount}
                        </Button>
                        ))}
                    </div>
                     {walletAddress && walletBalance && (
                        <div className="text-accent text-lg">Balance: {walletBalance} ETH</div>
                    )}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleJoinGame}
                            disabled={!selectedServer}
                            className="bg-primary text-primary-foreground text-2xl font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px] shadow-primary/70"
                        >
                            Join Game
                        </Button>
                        <Button
                            onClick={handleConnectWallet}
                            className="bg-transparent border-2 border-accent text-accent text-2xl font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px] hover:shadow-accent"
                        >
                             {walletAddress
                                ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
                                : 'Connect Wallet'}
                        </Button>
                    </div>
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
