import { useState, useMemo } from 'react';
import { useTasks, useCreateTask } from '@/hooks/useTasks';
import { useUpdateBlock, useDeleteBlock } from '@/hooks/useBlocks';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DeadlinePicker } from './DeadlinePicker';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X, CalendarIcon, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BlockCardProps {
  block: {
    id: string;
    name: string;
    description: string | null;
    vertical_id: string;
  };
}

export function BlockCard({ block }: BlockCardProps) {
  const { data: tasks = [] } = useTasks(block.id);
  const createTask = useCreateTask();
  const updateBlock = useUpdateBlock();
  const deleteBlock = useDeleteBlock();

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState<Date | undefined>(undefined);
  const [editingName, setEditingName] = useState(false);
  const [blockName, setBlockName] = useState(block.name);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const dueDate = newTaskDue ? new Date(newTaskDue) : undefined;
    if (dueDate && dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
      dueDate.setHours(8, 0, 0, 0);
    }
    createTask.mutate({
      block_id: block.id,
      title: newTaskTitle.trim(),
      due_date: dueDate ? dueDate.toISOString() : undefined,
    });
    setNewTaskTitle('');
    setNewTaskDue(undefined);
    setAddingTask(false);
  };

  const saveName = () => {
    if (blockName.trim() && blockName !== block.name) {
      updateBlock.mutate({ id: block.id, name: blockName.trim() });
    }
    setEditingName(false);
  };

  const [isOpen, setIsOpen] = useState(true);
  const [doneOpen, setDoneOpen] = useState(false);

  const sortByDue = (taskList: typeof tasks) =>
    [...taskList].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const activeTasks = useMemo(() => sortByDue(tasks.filter(t => t.status === 'active')), [tasks]);
  const doneTasks = useMemo(() => sortByDue(tasks.filter(t => t.status === 'done')), [tasks]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="glass-card p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        {editingName ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={blockName}
              onChange={e => setBlockName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="h-8 text-sm font-semibold"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveName}><Check className="h-3 w-3" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(false)}><X className="h-3 w-3" /></Button>
          </div>
        ) : (
          <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0 flex-1">
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0', isOpen ? 'rotate-0' : '-rotate-90')} />
            <h3 className="font-semibold text-sm text-foreground truncate" title={block.name}>{block.name}</h3>
            {activeTasks.length > 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 flex-shrink-0">{activeTasks.length}</span>
            )}
          </CollapsibleTrigger>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setAddingTask(true)}>
              <Plus className="mr-2 h-3 w-3" /> Add task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingName(true)}>
              <Pencil className="mr-2 h-3 w-3" /> Rename
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">
                  <Trash2 className="mr-2 h-3 w-3" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{block.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete this block and all its tasks. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteBlock.mutate(block.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {addingTask && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') { setAddingTask(false); setNewTaskDue(undefined); } }}
              placeholder="Task title..."
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateTask} className="h-8">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingTask(false); setNewTaskDue(undefined); }} className="h-8">
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn('h-7 text-xs gap-1.5 w-full justify-start', !newTaskDue && 'text-muted-foreground')}>
                <CalendarIcon className="h-3 w-3" />
                {newTaskDue ? format(newTaskDue, 'MMM d, yyyy h:mm a') : 'Set deadline'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DeadlinePicker
                selected={newTaskDue}
                onSelect={(d) => { if (d) setNewTaskDue(d); }}
                disablePast
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <CollapsibleContent className="space-y-1">
        {activeTasks.map(task => <TaskItem key={task.id} task={task} />)}

        {doneTasks.length > 0 && (
          <Collapsible open={doneOpen} onOpenChange={setDoneOpen} className="pt-2 mt-2 border-t border-border/50">
            <CollapsibleTrigger className="flex items-center gap-1.5 px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity w-full">
              <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform duration-200', doneOpen ? 'rotate-0' : '-rotate-90')} />
              <span className="text-xs font-medium text-muted-foreground">Done ({doneTasks.length})</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {doneTasks.map(task => (
                <div key={task.id} className="animate-fade-in">
                  <TaskItem task={task} />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
