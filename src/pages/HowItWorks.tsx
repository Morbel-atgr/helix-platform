import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, AlertTriangle, Clock, TrendingDown, Weight } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-foreground">How Health Scoring Works</h1>
      </div>

      {/* Health Score */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Health Score (0–100)</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each vertical (life domain) has a health score that reflects how well you're keeping up with your tasks. 
          The score starts at <strong className="text-foreground">100</strong> and decreases based on how close your tasks are to their deadlines.
        </p>

        <div className="space-y-3 mt-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <div className="mt-0.5 text-primary">✅</div>
            <div>
              <p className="text-sm font-medium text-foreground">More than 7 days away</p>
              <p className="text-xs text-muted-foreground">No penalty. You're in the clear — health stays high.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <Clock className="h-4 w-4 mt-0.5 text-health-medium flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">1–7 days away</p>
              <p className="text-xs text-muted-foreground">Health gradually decreases as the deadline approaches. The closer the deadline, the bigger the impact.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <TrendingDown className="h-4 w-4 mt-0.5 text-health-low flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Less than 48 hours</p>
              <p className="text-xs text-muted-foreground">Significant penalty. These tasks are flagged as "urgent" in your dashboard.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Overdue</p>
              <p className="text-xs text-muted-foreground">Major hit to health. The penalty grows with each day the task remains overdue.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Tasks without a deadline don't affect the health score. Completed tasks are excluded from the calculation.
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
          Every task has a <strong className="text-foreground">priority weight</strong> from 1 to 10 (default is 5). 
          This weight determines how much influence a task has on your health score and urgency ranking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Low priority (P1–P3)</p>
            <p className="text-xs text-muted-foreground">Minor impact on health. Good for nice-to-have tasks.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Medium priority (P4–P6)</p>
            <p className="text-xs text-muted-foreground">Moderate impact. Suitable for regular tasks.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">High priority (P7–P8)</p>
            <p className="text-xs text-muted-foreground">Strong impact. Use for important deadlines.</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <p className="text-sm font-medium text-foreground">Critical (P9–P10)</p>
            <p className="text-xs text-muted-foreground">Maximum impact. Missing these will significantly drop your health.</p>
          </div>
        </div>
      </section>

      {/* Urgency Ranking */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Top Urgent Tasks</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The home dashboard shows your <strong className="text-foreground">top 5 most urgent tasks</strong> across all verticals. 
          This ranking combines time pressure (how close/overdue a deadline is) with the task's priority weight to surface what needs your attention most.
        </p>
      </section>
    </div>
  );
}
