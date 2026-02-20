import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
  return (
    <div className="space-y-8 animate-slide-up max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">About Helix</h1>
      </div>

      <section className="glass-card p-8 space-y-6 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Helix</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            A personal life-management tool that helps you organize your life into domains, 
            track tasks with smart deadlines, and stay on top of what matters most.
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">Created by</p>
          <p className="text-lg font-semibold text-foreground mt-1">Mor Bel</p>
          <p className="text-sm text-muted-foreground mt-0.5">Product Manager & Information Systems Student</p>
        </div>
      </section>
    </div>
  );
}
