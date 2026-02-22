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
  eachHourOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  differenceInCalendarDays,
  getHours,
  startOfDay,
  endOfDay,
} from 'date-fns';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  status: string;
  importance_weight: number;
  vertical_name: string;
  vertical_color: string;
  vertical_id: string;
}

interface CalendarPageProps {
  onTaskClick?: (verticalId: string, taskId: string) => void;
}

function getDaysLabel(dueDate: string) {
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const dueDateStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = differenceInCalendarDays(dueDateStart, currentDate);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, urgency: 'overdue' as const };
  if (days === 0) return { label: 'Today', urgency: 'today' as const };
  if (days === 1) return { label: '1d left', urgency: 'soon' as const };
  if (days <= 7) return { label: `${days}d left`, urgency: 'week' as const };
  return { label: `${days}d left`, urgency: 'safe' as const };
}

const urgencyColors = {
  overdue: 'text-destructive',
  today: 'text-health-low',
  soon: 'text-health-low',
  week: 'text-health-medium',
  safe: 'text-primary',
};

// Shared task card component
function TaskCard({ task, compact = false, onClick }: { task: CalendarTask; compact?: boolean; onClick?: () => void }) {
  const isDone = task.status === 'done';
  const { label, urgency } = getDaysLabel(task.due_date);
  return (
    <div
      onClick={onClick}
      className={cn(
        'leading-snug px-1.5 rounded-md transition-all',
        onClick && 'cursor-pointer hover:shadow-sm hover:scale-[1.01]',
        !onClick && 'cursor-default',
        compact ? 'text-[11px] py-1' : 'text-xs py-1.5',
        isDone ? 'bg-muted/60 text-muted-foreground line-through' : 'font-medium'
      )}
      style={!isDone ? {
        backgroundColor: `${task.vertical_color}12`,
        borderLeft: `2.5px solid ${task.vertical_color}`,
      } : undefined}
      title={`${task.title} · ${task.vertical_name} · P${task.importance_weight}`}
    >
      <div className="break-words">{task.title}</div>
      {!isDone && (
        <div className={cn(compact ? 'text-[10px]' : 'text-[11px]', 'font-semibold mt-0.5', urgencyColors[urgency])}>
          {!compact && <span className="text-muted-foreground font-normal">{format(new Date(task.due_date), 'HH:mm')} · </span>}
          {label}
        </div>
      )}
      {!compact && !isDone && (
        <div className="text-[10px] text-muted-foreground mt-0.5">{task.vertical_name}</div>
      )}
    </div>
  );
}

export function CalendarPage({ onTaskClick }: CalendarPageProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');

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
          vertical_id: verticalId || '',
        };
      }) as CalendarTask[];
    },
    enabled: !!user,
  });

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    tasks.forEach(task => {
      const dayKey = format(new Date(task.due_date), 'yyyy-MM-dd');
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(task);
    });
    map.forEach((dayTasks, key) => {
      map.set(key, dayTasks.sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return b.importance_weight - a.importance_weight;
      }));
    });
    return map;
  }, [tasks]);

  // Navigation
  const goBack = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };
  const goForward = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  // Header label
  const headerLabel = view === 'month'
    ? format(currentDate, 'MMMM yyyy')
    : view === 'week'
      ? `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`
      : format(currentDate, 'EEEE, MMMM d, yyyy');

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Month view days
  const monthDays = useMemo(() => {
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    return eachDayOfInterval({ start: startOfWeek(ms, { weekStartsOn: 0 }), end: endOfWeek(me, { weekStartsOn: 0 }) });
  }, [currentDate]);

  // Week view days
  const weekDays = useMemo(() => {
    const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
    const we = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: ws, end: we });
  }, [currentDate]);

  // Day view hours (6am to 11pm)
  const dayHours = useMemo(() => Array.from({ length: 18 }, (_, i) => i + 6), []);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{headerLabel}</h1>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'active').length} active tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {(['day', 'week', 'month'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                  view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={goBack}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7 rounded-md px-3" onClick={goToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={goForward}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {view === 'month' && (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="grid grid-cols-7 bg-muted/30">
            {weekDayHeaders.map(day => (
              <div key={day} className="px-2 py-3 text-[11px] font-semibold text-muted-foreground text-center uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDay.get(dayKey) || [];
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);
              return (
                <div
                  key={dayKey}
                  className={cn(
                    'min-h-[80px] border-b border-r border-border/50 p-2 transition-all',
                    !inMonth && 'bg-muted/10 opacity-40',
                    today && 'bg-primary/[0.04] ring-1 ring-inset ring-primary/20',
                    i % 7 === 6 && 'border-r-0',
                  )}
                >
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
                  <div className="space-y-[3px]">
                    {dayTasks.slice(0, 3).map(task => (
                      <TaskCard key={task.id} task={task} compact onClick={onTaskClick ? () => onTaskClick(task.vertical_id, task.id) : undefined} />
                    ))}
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
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <div className="glass-card overflow-hidden rounded-xl">
          {/* Day headers */}
          <div className="grid grid-cols-7 bg-muted/30">
            {weekDays.map(day => {
              const today = isToday(day);
              return (
                <div key={day.toISOString()} className="px-2 py-3 text-center">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    'text-lg font-bold mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mx-auto',
                    today && 'bg-primary text-primary-foreground',
                    !today && 'text-foreground',
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Task columns */}
          <div className="grid grid-cols-7 divide-x divide-border/50">
            {weekDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDay.get(dayKey) || [];
              const today = isToday(day);
              return (
                <div
                  key={dayKey}
                  className={cn(
                    'min-h-[400px] p-2 space-y-1.5',
                    today && 'bg-primary/[0.03]',
                  )}
                >
                  {dayTasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={onTaskClick ? () => onTaskClick(task.vertical_id, task.id) : undefined} />
                  ))}
                  {dayTasks.length === 0 && (
                    <div className="text-[10px] text-muted-foreground/50 text-center pt-4">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {view === 'day' && (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="divide-y divide-border/30">
            {dayHours.map(hour => {
              const dayKey = format(currentDate, 'yyyy-MM-dd');
              const hourTasks = (tasksByDay.get(dayKey) || []).filter(task => {
                const taskHour = getHours(new Date(task.due_date));
                return taskHour === hour;
              });
              const now = new Date();
              const isCurrentHour = isToday(currentDate) && now.getHours() === hour;

              return (
                <div
                  key={hour}
                  className={cn(
                    'flex min-h-[60px] transition-colors',
                    isCurrentHour && 'bg-primary/[0.04]',
                  )}
                >
                  {/* Time label */}
                  <div className={cn(
                    'w-20 flex-shrink-0 py-2 px-3 text-right border-r border-border/50',
                    isCurrentHour ? 'text-primary font-semibold' : 'text-muted-foreground',
                  )}>
                    <span className="text-xs">{format(new Date(2000, 0, 1, hour), 'h a')}</span>
                  </div>
                  {/* Tasks */}
                  <div className="flex-1 p-2 space-y-1.5">
                    {hourTasks.map(task => (
                      <TaskCard key={task.id} task={task} onClick={onTaskClick ? () => onTaskClick(task.vertical_id, task.id) : undefined} />
                    ))}
                  </div>
                </div>
              );
            })}
            {/* Tasks without matching hour (show at bottom) */}
            {(() => {
              const dayKey = format(currentDate, 'yyyy-MM-dd');
              const allDayTasks = (tasksByDay.get(dayKey) || []).filter(task => {
                const h = getHours(new Date(task.due_date));
                return h < 6 || h > 23;
              });
              if (allDayTasks.length === 0) return null;
              return (
                <div className="flex min-h-[60px]">
                  <div className="w-20 flex-shrink-0 py-2 px-3 text-right border-r border-border/50 text-muted-foreground">
                    <span className="text-xs">Other</span>
                  </div>
                  <div className="flex-1 p-2 space-y-1.5">
                    {allDayTasks.map(task => (
                      <TaskCard key={task.id} task={task} onClick={onTaskClick ? () => onTaskClick(task.vertical_id, task.id) : undefined} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
