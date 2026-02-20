import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, AlertTriangle, Clock, TrendingDown, Weight, Layers, LayoutGrid, CheckSquare } from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
}

export function HowItWorks({ onBack }: HowItWorksProps) {
  return (
    <div className="space-y-8 animate-slide-up max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">How Helix Works</h1>
      </div>

      {/* Core Concepts */}
      <section className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Core Concepts</h2>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Verticals</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Life domains like "Degree", "Work", or "Health". Each vertical has its own health score and contains blocks. 
              You can customize their color and manage them from the sidebar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LayoutGrid className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Blocks</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Groups of related tasks within a vertical — like courses, projects, or focus areas. 
              Blocks are collapsible and can be renamed or deleted from the three-dot menu.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Tasks</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Individual action items with optional deadlines and priority weights (P1–P10). 
              Tasks auto-sort by deadline urgency. Checking a task moves it to the "Done" section. 
              You can edit the title, deadline (with time), and priority inline.
            </p>
          </div>
        </div>
      </section>

      {/* Health Score */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Health Score (0–100)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each vertical has a health score that reflects how well you're keeping up with your tasks. 
          The score starts at <strong className="text-foreground">100</strong> and decreases based on how close your tasks are to their deadlines.
        </p>

        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className="mt-0.5 text-primary">✅</div>
            <div>
              <p className="text-sm font-medium text-foreground">More than 7 days away</p>
              <p className="text-xs text-muted-foreground">No penalty. Health stays high.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <Clock className="h-4 w-4 mt-0.5 text-health-medium flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">1–7 days away</p>
              <p className="text-xs text-muted-foreground">Health gradually decreases as the deadline approaches.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <TrendingDown className="h-4 w-4 mt-0.5 text-health-low flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Less than 48 hours</p>
              <p className="text-xs text-muted-foreground">Significant penalty. Flagged as urgent in your dashboard.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Overdue</p>
              <p className="text-xs text-muted-foreground">Major hit. Penalty grows with each day overdue.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Tasks without a deadline don't affect health. Completed tasks are excluded.
        </p>
      </section>

      {/* Priority Weight */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Weight className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Priority Weight (P1–P10)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every task has a priority weight from 1 to 10 (default: 5). 
          This determines how much it impacts your health score and urgency ranking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Low (P1–P3)</p>
            <p className="text-xs text-muted-foreground">Minor impact. Nice-to-have tasks.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Medium (P4–P6)</p>
            <p className="text-xs text-muted-foreground">Moderate impact. Regular tasks.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">High (P7–P8)</p>
            <p className="text-xs text-muted-foreground">Strong impact. Important deadlines.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Critical (P9–P10)</p>
            <p className="text-xs text-muted-foreground">Maximum impact. Missing these tanks your health.</p>
          </div>
        </div>
      </section>

      {/* Urgency Ranking */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Top Urgent Tasks</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Home dashboard shows your <strong className="text-foreground">top 5 most urgent tasks</strong> across all verticals. 
          Ranking combines time pressure with priority weight to surface what needs attention most.
        </p>
      </section>
    </div>
  );
}
