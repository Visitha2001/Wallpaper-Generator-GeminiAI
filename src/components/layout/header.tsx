import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="p-4 border-b border-border/50">
      <div className="container mx-auto flex items-center gap-2">
        <Sparkles className="text-primary [--glow-color:hsl(var(--primary))] drop-shadow-[0_0_6px_var(--glow-color)] h-8 w-8" />
        <h1 className="text-2xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Neonize
        </h1>
      </div>
    </header>
  );
}
