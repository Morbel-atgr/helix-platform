import { HealthBar } from './HealthBar';
import { AlertTriangle, Clock } from 'lucide-react';
import type { HealthResult } from '@/services/healthScoring';

interface VerticalHealthProps {
  health: HealthResult;
  verticalName: string;
}

export function VerticalHealth({ health, verticalName }: VerticalHealthProps) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {verticalName} Health
        </h2>
        <span className="text-2xl font-bold font-mono text-gradient">
          {Math.round(health.score)}
        </span>
      </div>

      <HealthBar score={health.score} />

      <div className="flex gap-6">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-muted-foreground">Overdue:</span>
          <span className="font-mono font-medium text-foreground">{health.overdueCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-health-medium" />
          <span className="text-muted-foreground">Urgent:</span>
          <span className="font-mono font-medium text-foreground">{health.urgentCount}</span>
        </div>
      </div>
    </div>
  );
}
