import { useState } from 'react';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Calendar, Pencil, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
}

export function TaskItem({ task }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const isDone = task.status === 'done';
  const isOverdue = task.due_date && !isDone && new Date(task.due_date) < new Date();

  const toggleStatus = () => {
    updateTask.mutate({
      id: task.id,
      status: isDone ? 'active' : 'done',
      completed_at: isDone ? null : new Date().toISOString(),
    });
  };

  const saveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTask.mutate({ id: task.id, title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className={cn(
      'group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
      isDone ? 'opacity-50' : 'hover:bg-muted/50',
      isOverdue && !isDone && 'border-l-2 border-destructive'
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
          <div className={cn('flex items-center gap-1 mt-0.5 text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted" title="Priority weight">
          P{task.importance_weight}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={() => deleteTask.mutate(task.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
