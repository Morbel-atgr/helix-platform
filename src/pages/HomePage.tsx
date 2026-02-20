import { useVerticals } from '@/hooks/useVerticals';
import { useProfile } from '@/hooks/useProfile';
import { HealthBar } from '@/components/HealthBar';
import { calculateHealth } from '@/services/healthScoring';
import { getTopUrgentTasks, UrgencyTask } from '@/services/urgencyScoring';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Activity, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';

function getHealthLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Needs Attention';
  return 'Critical';
}

interface HomePageProps {
  onNavigateToTask?: (verticalId: string, taskId: string) => void;
  onNavigateToVertical?: (verticalId: string) => void;
}

export function HomePage({ onNavigateToTask, onNavigateToVertical }: HomePageProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: verticals = [] } = useVerticals();

  const verticalIds = verticals.map(v => v.id);
  const { data: allBlocks = [] } = useQuery({
    queryKey: ['all-blocks', verticalIds],
    queryFn: async () => {
      if (verticalIds.length === 0) return [];
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .in('vertical_id', verticalIds)
        .eq('archived', false);
      if (error) throw error;
      return data;
    },
    enabled: verticalIds.length > 0,
  });

  const blockIds = allBlocks.map(b => b.id);
  const { data: allTasks = [] } = useQuery({
    queryKey: ['home-all-tasks', blockIds],
    queryFn: async () => {
      if (blockIds.length === 0) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('block_id', blockIds);
      if (error) throw error;
      return data;
    },
    enabled: blockIds.length > 0,
  });

  const verticalHealthMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateHealth>> = {};
    for (const v of verticals) {
      const vBlockIds = allBlocks.filter(b => b.vertical_id === v.id).map(b => b.id);
      const vTasks = allTasks.filter(t => vBlockIds.includes(t.block_id));
      map[v.id] = calculateHealth(vTasks);
    }
    return map;
  }, [verticals, allBlocks, allTasks]);

  const urgentTasks = useMemo(() => {
    const enriched: UrgencyTask[] = allTasks.map(t => {
      const block = allBlocks.find(b => b.id === t.block_id);
      const vertical = verticals.find(v => v.id === block?.vertical_id);
      return { ...t, vertical_id: vertical?.id, vertical_name: vertical?.name, vertical_color: vertical?.color ?? undefined };
    });
    return getTopUrgentTasks(enriched);
  }, [allTasks, allBlocks, verticals]);

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="text-foreground" style={{ fontFamily: "'Bumbbled', cursive", fontWeight: 300 }}>Hello,</span>{' '}
          <span className="text-foreground">{profile?.name || 'there'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's how your life domains are doing.</p>
      </div>

      {/* Life Domains */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Life Domains
        </h2>

        {verticals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map(v => {
              const h = verticalHealthMap[v.id] || { score: null, overdueCount: 0, urgentCount: 0, hasActiveTasks: false };
              const noTasks = h.score === null;
              return (
                <div
                  key={v.id}
                  className="glass-card p-5 space-y-3 cursor-pointer hover:bg-muted/50 transition-all"
                  onClick={() => onNavigateToVertical?.(v.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                    <h3 className="font-semibold text-foreground">{v.name}</h3>
                  </div>
                  {noTasks ? (
                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{getHealthLabel(h.score!)}</span>
                        <span className={cn('font-semibold', {
                          'text-health-high': h.score! >= 70,
                          'text-health-medium': h.score! >= 40 && h.score! < 70,
                          'text-health-low': h.score! < 40,
                        })}>{Math.round(h.score!)}%</span>
                      </div>
                      <HealthBar score={h.score!} showLabel={false} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No verticals yet. Create your first life domain to get started.</p>
          </div>
        )}
      </div>

      {/* Top Urgent Tasks */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Top Urgent Tasks
        </h2>

        {urgentTasks.length > 0 ? (
          <div className="glass-card divide-y divide-border">
            {urgentTasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              const daysLeft = task.due_date
                ? differenceInCalendarDays(new Date(task.due_date), new Date())
                : null;
              const daysLabel = daysLeft !== null
                ? daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1d left' : `${daysLeft}d left`
                : null;
              return (
                <div
                  key={task.id}
                  className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => task.vertical_id && onNavigateToTask?.(task.vertical_id, task.id)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.vertical_color || 'hsl(var(--primary))' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.vertical_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {task.due_date && (
                      <span className={cn('text-xs font-medium', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                    {daysLabel && (
                      <span className={cn('text-xs font-medium', daysLeft! < 0 ? 'text-destructive' : daysLeft! <= 2 ? 'text-health-low' : daysLeft! <= 7 ? 'text-health-medium' : 'text-primary')}>
                        {daysLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground">No urgent tasks. You're on top of things!</p>
          </div>
        )}
      </div>
    </div>
  );
}
