import { useVerticals } from '@/hooks/useVerticals';
import { useProfile } from '@/hooks/useProfile';
import { HealthBar } from '@/components/HealthBar';
import { calculateHealth } from '@/services/healthScoring';
import { getTopUrgentTasks, UrgencyTask } from '@/services/urgencyScoring';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function HomePage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: verticals = [] } = useVerticals();

  // Fetch ALL blocks for all verticals
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

  // Health per vertical
  const verticalHealthMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateHealth>> = {};
    for (const v of verticals) {
      const vBlockIds = allBlocks.filter(b => b.vertical_id === v.id).map(b => b.id);
      const vTasks = allTasks.filter(t => vBlockIds.includes(t.block_id));
      map[v.id] = calculateHealth(vTasks);
    }
    return map;
  }, [verticals, allBlocks, allTasks]);

  // Top 5 urgent
  const urgentTasks = useMemo(() => {
    const enriched: UrgencyTask[] = allTasks.map(t => {
      const block = allBlocks.find(b => b.id === t.block_id);
      const vertical = verticals.find(v => v.id === block?.vertical_id);
      return {
        ...t,
        vertical_name: vertical?.name,
        vertical_color: vertical?.color ?? undefined,
      };
    });
    return getTopUrgentTasks(enriched);
  }, [allTasks, allBlocks, verticals]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, <span className="text-gradient">{profile?.name || 'there'}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your life at a glance.</p>
      </div>

      {/* Vertical Summary Grid */}
      {verticals.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Verticals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map(v => {
              const h = verticalHealthMap[v.id] || { score: 100, overdueCount: 0, urgentCount: 0 };
              return (
                <div key={v.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                    <h3 className="font-semibold text-foreground text-sm">{v.name}</h3>
                  </div>
                  <HealthBar score={h.score} size="sm" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-destructive" /> {h.overdueCount} overdue
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-health-medium" /> {h.urgentCount} urgent
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No verticals yet. Create your first life domain to get started.</p>
        </div>
      )}

      {/* Top 5 Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-health-medium" /> Top Urgent Tasks
          </h2>
          <div className="space-y-2">
            {urgentTasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              return (
                <div key={task.id} className="glass-card px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.vertical_color || 'hsl(var(--primary))' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.vertical_name}</p>
                  </div>
                  {task.due_date && (
                    <span className={cn('text-xs font-mono', isOverdue ? 'text-destructive' : 'text-health-medium')}>
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    W{task.importance_weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
