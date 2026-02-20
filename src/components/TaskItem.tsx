import { useState, useRef, useEffect } from 'react';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DeadlinePicker } from './DeadlinePicker';
import { Trash2, Calendar as CalendarIcon, Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays } from 'date-fns';
import { fireConfetti } from '@/lib/confetti';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    importance_weight: number;
    status: string;
    completed_at: string | null;
  };
  highlight?: boolean;
}

export function TaskItem({ task, highlight }: TaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight]);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const isDone = task.status === 'done';
  const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();

  const daysLeft = task.due_date && !isDone
    ? differenceInCalendarDays(new Date(task.due_date), new Date())
    : null;

  const daysLabel = daysLeft !== null
    ? daysLeft < 0
      ? `${Math.abs(daysLeft)}d overdue`
      : daysLeft === 0
        ? 'Due today'
        : daysLeft === 1
          ? '1d left'
          : `${daysLeft}d left`
    : null;

  const [justCompleted, setJustCompleted] = useState(false);

  const toggleStatus = () => {
    const newDone = !isDone;
    updateTask.mutate({
      id: task.id,
      status: newDone ? 'done' : 'active',
      completed_at: newDone ? new Date().toISOString() : null,
    });
    if (newDone) {
      setJustCompleted(true);
      fireConfetti();
      setTimeout(() => setJustCompleted(false), 400);
    }
  };

  const saveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTask.mutate({ id: task.id, title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div ref={ref} className={cn(
      'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300',
      isDone ? 'opacity-50' : 'hover:bg-muted/50',
      isOverdue && !isDone && 'border-l-2 border-destructive',
      justCompleted && 'animate-task-done',
      highlight && 'animate-highlight-pulse rounded-lg'
    )}>
      <Checkbox
        checked={isDone}
        onCheckedChange={toggleStatus}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditing(false); }}
              className="h-7 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveTitle}><Check className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}><X className="h-3 w-3" /></Button>
          </div>
        ) : (
          <span className={cn('text-sm', isDone && 'line-through text-muted-foreground')}>
            {task.title}
          </span>
        )}

        {task.due_date && (
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn('flex items-center gap-1 mt-0.5 text-xs hover:underline cursor-pointer whitespace-nowrap', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                {format(new Date(task.due_date), 'MMM d, HH:mm')}
                {daysLabel && (
                  <span className={cn(
                    'font-medium',
                    daysLeft! < 0 ? 'text-destructive' : daysLeft! <= 2 ? 'text-health-low' : daysLeft! <= 7 ? 'text-health-medium' : 'text-primary'
                  )}>
                    · {daysLabel}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DeadlinePicker
                selected={new Date(task.due_date)}
                onSelect={(date) => {
                  if (date) {
                    updateTask.mutate({ id: task.id, due_date: date.toISOString() });
                  } else {
                    updateTask.mutate({ id: task.id, due_date: null });
                  }
                }}
                showRemove
              />
            </PopoverContent>
          </Popover>
        )}
        {!task.due_date && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <CalendarIcon className="h-3 w-3" />
                Set deadline
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DeadlinePicker
                selected={undefined}
                onSelect={(date) => {
                  if (date) {
                    updateTask.mutate({ id: task.id, due_date: date.toISOString() });
                  }
                }}
                disablePast
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 cursor-pointer transition-colors" title="Click to change priority">
              P{task.importance_weight}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Priority (1–10)</p>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {[1,2,3,4,5,6,7,8,9,10].map(w => (
                  <button
                    key={w}
                    onClick={() => updateTask.mutate({ id: task.id, importance_weight: w })}
                    className={cn(
                      'w-7 h-7 rounded text-xs font-mono transition-colors',
                      task.importance_weight === w
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete task?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete "{task.title}". This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTask.mutate(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
