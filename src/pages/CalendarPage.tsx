import { useState, useMemo } from 'react';
import { useVerticals } from '@/hooks/useVerticals';
import { useBlocks } from '@/hooks/useBlocks';
import { useAllTasks } from '@/hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
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

export function CalendarPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch all tasks across all verticals
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
    return map;
  }, [tasks]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="glass-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map(day => (
            <div key={day} className="px-2 py-2 text-xs font-medium text-muted-foreground text-center">
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

            return (
              <div
                key={dayKey}
                className={cn(
                  'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
                  !inMonth && 'bg-muted/20',
                  i % 7 === 0 && 'border-l-0',
                  isToday(day) && 'bg-primary/5',
                )}
              >
                <div className={cn(
                  'text-xs font-medium mb-1 flex items-center justify-center w-6 h-6 rounded-full',
                  isToday(day) && 'bg-primary text-primary-foreground',
                  !isToday(day) && inMonth && 'text-foreground',
                  !inMonth && 'text-muted-foreground/50',
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-default',
                        task.status === 'done'
                          ? 'bg-muted text-muted-foreground line-through'
                          : 'text-foreground font-medium'
                      )}
                      style={{
                        backgroundColor: task.status !== 'done' ? `${task.vertical_color}20` : undefined,
                        borderLeft: task.status !== 'done' ? `2px solid ${task.vertical_color}` : undefined,
                      }}
                      title={`${task.title} (${task.vertical_name}) P${task.importance_weight}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1.5">
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
