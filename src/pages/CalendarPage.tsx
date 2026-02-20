import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  differenceInCalendarDays,
} from 'date-fns';

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  importance_weight: number;
  vertical_name: string;
  vertical_color: string;
}

function getDaysLabel(dueDate: string) {
  const days = differenceInCalendarDays(new Date(dueDate), new Date());
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, urgency: 'overdue' as const };
  if (days === 0) return { label: 'Today', urgency: 'today' as const };
  if (days === 1) return { label: '1d', urgency: 'soon' as const };
  if (days <= 7) return { label: `${days}d`, urgency: 'week' as const };
  return { label: `${days}d`, urgency: 'safe' as const };
}

const urgencyColors = {
  overdue: 'text-destructive',
  today: 'text-health-low',
  soon: 'text-health-low',
  week: 'text-health-medium',
  safe: 'text-primary',
};

export function CalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasks = [] } = useQuery({
    queryKey: ['calendar-tasks', user?.id],
    queryFn: async () => {
      const { data: verticals } = await supabase
        .from('verticals')
        .select('id, name, color')
        .eq('user_id', user!.id)
        .eq('archived', false);

      if (!verticals?.length) return [];

      const { data: blocks } = await supabase
        .from('blocks')
        .select('id, vertical_id')
        .in('vertical_id', verticals.map(v => v.id))
        .eq('archived', false);

      if (!blocks?.length) return [];

      const verticalMap = new Map(verticals.map(v => [v.id, v]));
      const blockVerticalMap = new Map(blocks.map(b => [b.id, b.vertical_id]));

      const { data: taskData } = await supabase
        .from('tasks')
        .select('id, title, due_date, status, importance_weight, block_id')
        .in('block_id', blocks.map(b => b.id))
        .not('due_date', 'is', null);

      if (!taskData) return [];

      return taskData.map(t => {
        const verticalId = blockVerticalMap.get(t.block_id);
        const vertical = verticalId ? verticalMap.get(verticalId) : null;
        return {
          id: t.id,
          title: t.title,
          due_date: t.due_date!,
          status: t.status,
          importance_weight: t.importance_weight,
          vertical_name: vertical?.name || '',
          vertical_color: vertical?.color || 'hsl(var(--primary))',
        };
      }) as CalendarTask[];
    },
    enabled: !!user,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    tasks.forEach(task => {
      const dayKey = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(task);
    });
    // Sort tasks within each day: active first (by importance desc), then done
    map.forEach((dayTasks, key) => {
      map.set(key, dayTasks.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return b.importance_weight - a.importance_weight;
      }));
    });
    return map;
  }, [tasks]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'active').length} active tasks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={isToday(currentMonth) ? 'default' : 'ghost'}
            size="sm"
            className="text-xs h-7 rounded-md px-3"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="glass-card overflow-hidden rounded-xl">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted/30">
          {weekDays.map(day => (
            <div key={day} className="px-2 py-3 text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDay.get(dayKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={dayKey}
                className={cn(
                  'min-h-[110px] border-b border-r border-border/50 p-2 transition-all',
                  !inMonth && 'bg-muted/10 opacity-40',
                  today && 'bg-primary/[0.04] ring-1 ring-inset ring-primary/20',
                  i % 7 === 6 && 'border-r-0',
                )}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className={cn(
                    'text-xs font-medium flex items-center justify-center w-6 h-6 rounded-full transition-colors',
                    today && 'bg-primary text-primary-foreground shadow-sm',
                    !today && inMonth && 'text-foreground',
                  )}>
                    {format(day, 'd')}
                  </div>
                  {dayTasks.length > 0 && !today && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-[3px] overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => {
                    const isDone = task.status === 'done';
                    const { label, urgency } = getDaysLabel(task.due_date);
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'text-[10px] leading-tight px-1.5 py-[3px] rounded-md flex items-center gap-1 group/task cursor-default transition-all hover:shadow-sm',
                          isDone
                            ? 'bg-muted/60 text-muted-foreground line-through'
                            : 'font-medium'
                        )}
                        style={!isDone ? {
                          backgroundColor: `${task.vertical_color}12`,
                          borderLeft: `2.5px solid ${task.vertical_color}`,
                        } : undefined}
                        title={`${task.title} · ${task.vertical_name} · P${task.importance_weight}`}
                      >
                        <span className="truncate flex-1">{task.title}</span>
                        {!isDone && (
                          <span className={cn('text-[9px] flex-shrink-0 font-semibold', urgencyColors[urgency])}>
                            {label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-muted-foreground font-medium px-1.5 cursor-default">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
