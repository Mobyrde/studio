
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { generateFoodColorPalette } from '@/ai/flows/generate-food-color-palette';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';

// Types
type Position = { x: number; y: number };
type Snake = Position[];
type Food = Position & { color: string; value: number };
type Bot = {
  id: number;
  name: string;
  body: Snake;
  direction: Position;
  speed: number;
  color: string;
  turnTimer: number;
  balance: number;
};
type GameState = {
  snake: Snake;
  direction: Position;
  targetDirection: Position;
  food: Food[];
  bots: Bot[];
  camera: Position;
  speed: number;
  growing: number;
  boosting: boolean;
  boostDistanceCounter: number;
};

// Constants
const WORLD_SIZE = 3000;
const BASE_SNAKE_RADIUS = 7;
const BOT_SNAKE_RADIUS = 8;
const FOOD_RADIUS = 5;
const BOT_COUNT = 8;
const FOOD_COUNT = 200;
const PLAYER_SPEED = 3.5;
const BOOST_SPEED = 7;
const BOOST_SHRINK_DISTANCE = 50; 
const STARTING_SNAKE_LENGTH = 10;
const TURN_SPEED = 0.05;

let botIdCounter = 0;

interface SlitherGameProps {
  onGameOver: () => void;
  lobby: number;
  playerName: string;
}

const getPlayerRadius = (length: number) => {
    return BASE_SNAKE_RADIUS + Math.log10(length) * 2;
}

const SlitherGame = ({ onGameOver, lobby, playerName }: SlitherGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOverState, setGameOverState] = useState(false);
  const [score, setScore] = useState(0);
  const [balance, setBalance] = useState(lobby);
  const [snakeLength, setSnakeLength] = useState(STARTING_SNAKE_LENGTH);
  const [highScore, setHighScore] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const gameStateRef = useRef<GameState>({
    snake: Array.from({ length: STARTING_SNAKE_LENGTH }, (_, i) => ({ x: WORLD_SIZE / 2 - i * 10, y: WORLD_SIZE / 2 })),
    direction: { x: 1, y: 0 },
    targetDirection: { x: 1, y: 0 },
    food: [],
    bots: [],
    camera: { x: 0, y: 0 },
    speed: PLAYER_SPEED,
    growing: 0,
    boosting: false,
    boostDistanceCounter: 0,
  });
  const foodColorsRef = useRef<string[]>([]);

  useEffect(() => {
    if (gameOverState) {
      onGameOver();
    }
  }, [gameOverState, onGameOver]);

  // Fetch AI-generated food colors on component mount
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colors = await generateFoodColorPalette({ count: 50 });
        foodColorsRef.current = colors;
      } catch (error) {
        console.error("Failed to generate food colors, using fallback:", error);
        foodColorsRef.current = Array.from({ length: 50 }, () => `hsl(${Math.random() * 360}, 90%, 70%)`);
      } finally {
        setIsReady(true);
      }
    };
    fetchColors();
  }, []);

  // Main game loop effect
  useEffect(() => {
    if (!isReady) return;

    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const generateFood = (count: number, position?: Position, value = 0): Food[] => {
      const colors = foodColorsRef.current;
      if (colors.length === 0) return [];
      return Array.from({ length: count }, () => ({
        x: position ? position.x + (Math.random() - 0.5) * 50 : Math.random() * WORLD_SIZE,
        y: position ? position.y + (Math.random() - 0.5) * 50 : Math.random() * WORLD_SIZE,
        color: value > 0 ? 'gold' : colors[Math.floor(Math.random() * colors.length)],
        value: value,
      }));
    };

    const generateBot = (): Bot => {
      const length = 10 + Math.floor(Math.random() * 20);
      const x = Math.random() * WORLD_SIZE;
      const y = Math.random() * WORLD_SIZE;
      const body: Snake = Array.from({ length }, (_, i) => ({ x: x - i * 15, y }));
      return {
        id: botIdCounter++,
        name: `Bot ${botIdCounter}`,
        body,
        direction: { x: Math.random() - 0.5, y: Math.random() - 0.5 },
        speed: 2 + Math.random(),
        color: `hsl(${Math.random() * 360}, 60%, 50%)`,
        turnTimer: 0,
        balance: lobby,
      };
    };

    const initGame = () => {
      botIdCounter = 0;
      gameStateRef.current = {
        snake: Array.from({ length: STARTING_SNAKE_LENGTH }, (_, i) => ({ x: WORLD_SIZE / 2 - i * 10, y: WORLD_SIZE / 2 })),
        direction: { x: 1, y: 0 },
        targetDirection: { x: 1, y: 0 },
        food: generateFood(FOOD_COUNT, undefined, 0),
        bots: Array(BOT_COUNT).fill(null).map(generateBot),
        camera: { x: (WORLD_SIZE / 2) - canvas.width / 2, y: (WORLD_SIZE / 2) - canvas.height / 2 },
        speed: PLAYER_SPEED,
        growing: 0,
        boosting: false,
        boostDistanceCounter: 0,
      };
      setSnakeLength(STARTING_SNAKE_LENGTH);
      setBalance(lobby);
      setScore(0);
      setGameOverState(false);
      gameLoop();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (gameStateRef.current.snake.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        gameStateRef.current.targetDirection = { x: dx / length, y: dy / length };
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0) {
            gameStateRef.current.boosting = true;
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
            gameStateRef.current.boosting = false;
        }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    const checkCollision = (pos1: Position, pos2: Position, dist: number) => {
      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      return Math.sqrt(dx * dx + dy * dy) < dist;
    };

    const updateBot = (bot: Bot) => {
      bot.turnTimer--;
      if (bot.turnTimer <= 0) {
        bot.direction.x += (Math.random() - 0.5) * 0.3;
        bot.direction.y += (Math.random() - 0.5) * 0.3;
        const len = Math.sqrt(bot.direction.x ** 2 + bot.direction.y ** 2);
        bot.direction.x /= len;
        bot.direction.y /= len;
        bot.turnTimer = 30 + Math.random() * 60;
      }

      const head = bot.body[0];
      const newHead = { x: head.x + bot.direction.x * bot.speed, y: head.y + bot.direction.y * bot.speed };

      if (newHead.x < 0) newHead.x = WORLD_SIZE;
      if (newHead.x > WORLD_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = WORLD_SIZE;
      if (newHead.y > WORLD_SIZE) newHead.y = 0;

      bot.body.unshift(newHead);
      bot.body.pop();
    };

    function gameLoop() {
      if (!canvasRef.current) return;
      const state = gameStateRef.current;
      if (state.snake.length === 0) {
          if(!gameOverState) {
            setGameOverState(true);
          }
          cancelAnimationFrame(animationId);
          return;
      }

      const playerRadius = getPlayerRadius(state.snake.length);
      
      let isBoosting = state.boosting && state.snake.length > STARTING_SNAKE_LENGTH;

      if (isBoosting) {
          state.speed = BOOST_SPEED;
          state.boostDistanceCounter += state.speed;
      
          if (state.boostDistanceCounter >= BOOST_SHRINK_DISTANCE) {
              const shrinkAmount = Math.floor(state.boostDistanceCounter / BOOST_SHRINK_DISTANCE);
              for (let i = 0; i < shrinkAmount; i++) {
                  if (state.snake.length > STARTING_SNAKE_LENGTH) {
                      state.snake.pop();
                  }
              }
              setSnakeLength(state.snake.length);
              state.boostDistanceCounter %= BOOST_SHRINK_DISTANCE;
          }
      } else {
          state.speed = PLAYER_SPEED;
          state.boostDistanceCounter = 0;
      }
      
      // Update Player
      // Smoothly update direction
      state.direction.x += (state.targetDirection.x - state.direction.x) * TURN_SPEED;
      state.direction.y += (state.targetDirection.y - state.direction.y) * TURN_SPEED;
      const dirLength = Math.sqrt(state.direction.x**2 + state.direction.y**2);
      if (dirLength > 0) {
          state.direction.x /= dirLength;
          state.direction.y /= dirLength;
      }

      const head = state.snake[0];
      const newHead = {
        x: head.x + state.direction.x * state.speed,
        y: head.y + state.direction.y * state.speed,
      };

      if (newHead.x < 0 || newHead.x > WORLD_SIZE || newHead.y < 0 || newHead.y > WORLD_SIZE) {
        state.snake = [];
        if (!gameOverState) setGameOverState(true);
        return;
      }

      state.snake.unshift(newHead);

      let ateFood = false;
      state.food = state.food.filter(f => {
        if (checkCollision(newHead, f, playerRadius + FOOD_RADIUS)) {
          state.growing += 1;
          ateFood = true;
          setScore(s => s + 1);
          if (f.value > 0) {
            setBalance(b => b + f.value);
          }
          return false;
        }
        return true;
      });

      if (state.food.length < FOOD_COUNT) {
        state.food.push(...generateFood(FOOD_COUNT - state.food.length));
      }

      if (state.growing > 0) {
        state.growing--;
      } else {
        state.snake.pop();
      }
      setSnakeLength(state.snake.length);

      state.camera.x = newHead.x - canvas.width / 2;
      state.camera.y = newHead.y - canvas.height / 2;
      

      // Update Bots
      state.bots.forEach(updateBot);
      
      // Collision Checks
      const playerHead = state.snake[0];
      const killedBots: number[] = [];
      let playerDied = false;

      state.bots.forEach(bot => {
        if (!bot.body || bot.body.length === 0) return;
        const botHead = bot.body[0];
        const botRadius = BOT_SNAKE_RADIUS;

        // Check if player's head hits a bot's body -> PLAYER DIES
        for (let i = 1; i < bot.body.length; i++) {
          if (checkCollision(playerHead, bot.body[i], playerRadius + botRadius / 2)) {
            playerDied = true;
            return;
          }
        }

        // Check if bot's head hits player's body -> BOT DIES
        for (let i = 1; i < state.snake.length; i++) {
          if (checkCollision(botHead, state.snake[i], botRadius + playerRadius / 2)) {
            if (!killedBots.includes(bot.id)) {
                state.food.push(...generateFood(Math.floor(bot.body.length / 2), botHead, bot.balance / (bot.body.length / 2) ));
                killedBots.push(bot.id);
            }
            return;
          }
        }
      });
      
      if(playerDied) {
          state.food.push(...generateFood(Math.floor(state.snake.length / 2), playerHead, 0 ));
          setBalance(0);
          state.snake = [];
          if(!gameOverState) setGameOverState(true);
          return;
      }
      
      if (killedBots.length > 0) {
          state.bots = state.bots.filter(b => !killedBots.includes(b.id));
      }

      // Respawn bots if needed
      if (state.bots.length < BOT_COUNT) {
          state.bots.push(...Array(BOT_COUNT - state.bots.length).fill(null).map(generateBot));
      }


      // --- Drawing ---
      ctx.fillStyle = '#1A1A2E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-state.camera.x, -state.camera.y);

      // Draw Grid
      const gridSize = 50;
      ctx.strokeStyle = 'hsl(240 30% 30% / 0.5)';
      ctx.lineWidth = 1;
      for (let x = 0; x < WORLD_SIZE; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke();
      }
      for (let y = 0; y < WORLD_SIZE; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke();
      }

      // Draw World Border
      ctx.strokeStyle = 'hsl(180 100% 50%)';
      ctx.lineWidth = 8;
      ctx.shadowColor = 'hsl(180 100% 50%)';
      ctx.shadowBlur = 20;
      ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);
      ctx.shadowBlur = 0;

      // Draw Food
      state.food.forEach(f => {
        ctx.fillStyle = f.color;
        if (f.value > 0) {
          ctx.shadowColor = 'gold';
          ctx.shadowBlur = 15;
        }
        ctx.beginPath(); ctx.arc(f.x, f.y, FOOD_RADIUS + f.value * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      const drawName = (name: string, position: Position, color: string) => {
        ctx.fillStyle = color;
        ctx.font = '14px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, position.x, position.y - 20);
      }

      // Draw Bots
      ctx.globalAlpha = 1;
      state.bots.forEach(bot => {
        const segmentRadius = BOT_SNAKE_RADIUS;
        drawName(bot.name, bot.body[0], bot.color);
        bot.body.forEach((segment, i) => {
          ctx.fillStyle = bot.color;
          const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segmentRadius);
          gradient.addColorStop(0, bot.color);
          gradient.addColorStop(1, `hsl(${Math.random() * 360}, 60%, 30%)`);
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 1 - (i / bot.body.length) * 0.5;
          ctx.beginPath(); ctx.arc(segment.x, segment.y, segmentRadius, 0, Math.PI * 2); ctx.fill();
        });
      });
      ctx.globalAlpha = 1;

      // Draw Player
      const pulse = Math.abs(Math.sin(Date.now() / 300));
      drawName(playerName || 'Player', state.snake[0], 'hsl(267, 100%, 70%)');
      state.snake.forEach((segment, i) => {
        const segmentRadius = getPlayerRadius(state.snake.length);
        const gradient = ctx.createRadialGradient(segment.x, segment.y, 0, segment.x, segment.y, segmentRadius);
        gradient.addColorStop(0, 'hsl(267, 100%, 70%)');
        gradient.addColorStop(1, 'hsl(267, 100%, 50%)');
        ctx.fillStyle = gradient;

        if (i === 0) {
          ctx.shadowColor = 'hsl(267, 100%, 70%)';
          ctx.shadowBlur = 10 + pulse * 10;
        }
        
        ctx.beginPath(); ctx.arc(segment.x, segment.y, segmentRadius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        
        if (i === 0) {
            const eyeAngle = Math.atan2(state.direction.y, state.direction.x);
            const eyeRadius = Math.max(1, segmentRadius * 0.25);
            const eyeDist = segmentRadius * 0.6;
            
            // Eye whites
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(segment.x + Math.cos(eyeAngle + Math.PI/4) * eyeDist, segment.y + Math.sin(eyeAngle + Math.PI/4) * eyeDist, eyeRadius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x + Math.cos(eyeAngle - Math.PI/4) * eyeDist, segment.y + Math.sin(eyeAngle - Math.PI/4) * eyeDist, eyeRadius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            const pupilRadius = eyeRadius * 0.5;
            const pupilDist = eyeRadius * 0.3;
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(segment.x + Math.cos(eyeAngle + Math.PI/4) * eyeDist + Math.cos(eyeAngle) * pupilDist, segment.y + Math.sin(eyeAngle + Math.PI/4) * eyeDist + Math.sin(eyeAngle) * pupilDist, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x + Math.cos(eyeAngle - Math.PI/4) * eyeDist + Math.cos(eyeAngle) * pupilDist, segment.y + Math.sin(eyeAngle - Math.PI/4) * eyeDist + Math.sin(eyeAngle) * pupilDist, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      ctx.restore();
      animationId = requestAnimationFrame(gameLoop);
    };

    initGame();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationId);
    };
  }, [isReady, lobby, playerName]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);


  if (!isReady) {
    return (
        <Card className="w-[800px] h-[600px] bg-background border-2 border-accent shadow-2xl shadow-accent/20 flex flex-col items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center text-center">
                <Skeleton className="w-48 h-8 mb-4" />
                <Skeleton className="w-64 h-6" />
                <div className="mt-8 text-lg font-headline animate-pulse text-primary">GENERATING GALAXY...</div>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4 flex flex-wrap justify-center gap-4 md:gap-8 text-foreground font-headline">
        <div className="text-xl">Length: <span className="font-bold text-primary">{snakeLength}</span></div>
        <div className="text-xl">Balance: <span className="font-bold text-yellow-400">${balance.toFixed(2)}</span></div>
        <div className="text-xl">Score: <span className="font-bold text-purple-400">{score}</span></div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-accent rounded-lg shadow-2xl shadow-accent/20"
          aria-label="Neon Slither game board"
        />
      </div>
      
      <div className="mt-4 text-center text-muted-foreground">
        <p>Move your mouse to control the snake</p>
        <p>Hold left-click to boost!</p>
        <p className="text-sm">Eat the colorful dots to grow longer!</p>
      </div>
    </div>
  );
};

export default SlitherGame;
