import SlitherGame from '@/components/slither-game';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary mb-4 tracking-widest animate-pulse" style={{textShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))'}}>
        NEON SLITHER
      </h1>
      <SlitherGame />
    </main>
  );
}
