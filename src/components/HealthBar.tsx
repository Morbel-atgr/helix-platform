import { cn } from '@/lib/utils';

interface HealthBarProps {
  score: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

function getHealthColor(score: number): string {
  if (score >= 70) return 'bg-health-high';
  if (score >= 40) return 'bg-health-medium';
  return 'bg-health-low';
}

export function HealthBar({ score, size = 'md', showLabel = true }: HealthBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('health-bar-track flex-1', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getHealthColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('font-semibold tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm', {
          'text-health-high': score >= 70,
          'text-health-medium': score >= 40 && score < 70,
          'text-health-low': score < 40,
        })}>
          {Math.round(score)}%
        </span>
      )}
    </div>
  );
}
