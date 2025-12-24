
'use client';

import React, { useState } from 'react';
import SlitherGame from '@/components/slither-game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCode from 'qrcode.react';
import { Copy } from 'lucide-react';

type Server = {
    name: string;
    amount: number;
}

const SERVERS: Server[] = [
    { name: 'Server 1', amount: 1 },
    { name: 'Server 2', amount: 5 },
    { name: 'Server 3', amount: 20 },
]

const GAME_WALLET_ADDRESS = '0xDf302199E80B8ccF998Cfb746c46ce94B70F3e23';

declare global {
  interface Window {
    ethereum: any;
  }
}

const HomePage = () => {
  const [selectedServer, setSelectedServer] = useState<Server>(SERVERS[0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const { toast } = useToast();

  const handleLobbySelect = (server: Server) => {
    setSelectedServer(server);
  };

  const handleJoinGame = async () => {
    if (selectedServer && walletAddress) {
      setIsProcessingTx(true);
      toast({
        title: "Transaction Sent",
        description: `Staking ${selectedServer.amount} MATIC... Please confirm in your wallet.`,
      });

      try {
        const amountInWei = (selectedServer.amount * 10**18).toString(16);
        
        // This is a simulated transaction.
        // It asks the user to sign, but doesn't actually spend funds on a real mainnet.
        // To make this a real transaction, you would need a smart contract address and ABI.
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: walletAddress,
              to: GAME_WALLET_ADDRESS, 
              value: `0x${amountInWei}`,
              // 'data' would be the encoded function call to your smart contract
            },
          ],
        });

        // In a real app, you'd wait for the transaction to be mined.
        // We'll simulate that with a delay.
        setTimeout(() => {
          toast({
            title: "Transaction Confirmed!",
            description: `${selectedServer.amount} MATIC staked successfully. Joining game...`,
          });
          setGameOver(false);
          setGameStarted(true);
          setIsProcessingTx(false);
        }, 2000);

      } catch (error: any) {
        console.error("Transaction failed:", error);
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: error.message || "Could not complete the stake transaction.",
        });
        setIsProcessingTx(false);
      }
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
  
  const handleCashOut = () => {
    toast({
        title: "Coming Soon!",
        description: "Cashing out will be enabled in a future update.",
    });
  }

  const handleConnectWallet = async () => {
    if (window.ethereum) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];

            // Check if the user is on the Polygon network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const polygonChainId = '0x89'; // 137 in hex

            if (chainId !== polygonChainId) {
                try {
                    // Request to switch to the Polygon network
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: polygonChainId }],
                    });
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: polygonChainId,
                                        chainName: 'Polygon Mainnet',
                                        nativeCurrency: {
                                            name: 'MATIC',
                                            symbol: 'MATIC',
                                            decimals: 18,
                                        },
                                        rpcUrls: ['https://polygon-rpc.com/'],
                                        blockExplorerUrls: ['https://polygonscan.com/'],
                                    },
                                ],
                            });
                        } catch (addError) {
                            throw new Error("Failed to add Polygon network to wallet.");
                        }
                    } else {
                        throw new Error("Failed to switch to the Polygon network.");
                    }
                }
            }

            // Fetch balance
            const balanceWei = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
            });

            // Convert balance from Wei to MATIC
            const balanceMatic = parseFloat(balanceWei) / 10**18;
            setWalletBalance(balanceMatic.toFixed(4));
            setWalletAddress(address);

            toast({
                title: "Wallet Connected",
                description: `Connected to Polygon with address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
            });
        } catch (error: any) {
            console.error("Wallet connection failed:", error);
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: error.message || "Could not connect to the wallet. Please try again.",
            });
        }
    } else {
        toast({
            variant: "destructive",
            title: "No EVM Wallet Detected",
            description: "Please install a wallet like MetaMask or Trust Wallet.",
        });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard.",
    });
  }


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
                        <Card className="bg-card/50 border-muted-foreground/50 text-left w-96">
                            <CardHeader>
                                <CardTitle className="text-lg">Your Wallet</CardTitle>
                                <CardDescription className="text-xs truncate">{walletAddress}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-accent">{walletBalance} <span className='text-lg'>MATIC</span></div>
                                <div className="flex gap-2 mt-4">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full bg-transparent border border-accent text-accent hover:bg-accent/10">Add Funds</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] bg-card border-accent text-foreground">
                                            <DialogHeader>
                                                <DialogTitle>Add Funds</DialogTitle>
                                                <DialogDescription>
                                                    Send funds to the game treasury address below.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center gap-4 py-4">
                                                <div className="p-4 bg-white rounded-lg">
                                                    <QRCode value={GAME_WALLET_ADDRESS} size={200} />
                                                </div>
                                                <p className="text-center text-sm text-muted-foreground">Scan this code or copy the address below to send MATIC funds on the Polygon network.</p>
                                                <div className="flex items-center gap-2 w-full p-2 rounded-md bg-background border border-input">
                                                    <Input readOnly value={GAME_WALLET_ADDRESS} className="bg-transparent border-none text-sm truncate" />
                                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(GAME_WALLET_ADDRESS)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                     </Dialog>
                                     <Button onClick={handleCashOut} className="w-full bg-transparent border border-muted-foreground text-muted-foreground hover:border-accent hover:text-accent">Cash Out</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="bg-card/50 border-muted-foreground/50 text-left w-96">
                        <CardHeader>
                            <CardTitle className="text-lg">Game Treasury</CardTitle>
                            <CardDescription className="text-xs truncate">{GAME_WALLET_ADDRESS}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">0.00 <span className='text-lg'>MATIC</span></div>
                             <p className="text-xs text-muted-foreground mt-2">This is the treasury wallet. Funds are pooled here for gameplay.</p>
                        </CardContent>
                    </Card>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleJoinGame}
                            disabled={!selectedServer || !walletAddress || isProcessingTx || !playerName}
                            className="bg-primary text-primary-foreground text-2xl font-bold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px] shadow-primary/70"
                        >
                            {isProcessingTx ? 'Processing...' : 'Join Game'}
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

export default HomePage;

    