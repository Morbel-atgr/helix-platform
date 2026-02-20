import { useState } from 'react';
import { useTasks, useCreateTask } from '@/hooks/useTasks';
import { useUpdateBlock } from '@/hooks/useBlocks';
import { TaskItem } from './TaskItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, MoreHorizontal, Pencil, Archive, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [blockName, setBlockName] = useState(block.name);

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    createTask.mutate({ block_id: block.id, title: newTaskTitle.trim() });
    setNewTaskTitle('');
    setAddingTask(false);
  };

  const saveName = () => {
    if (blockName.trim() && blockName !== block.name) {
      updateBlock.mutate({ id: block.id, name: blockName.trim() });
    }
    setEditingName(false);
  };

  const activeTasks = tasks.filter(t => t.status === 'active');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="glass-card p-4 space-y-3 animate-slide-up">
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
          <h3 className="font-semibold text-sm text-foreground">{block.name}</h3>
        )}

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-mono">{activeTasks.length}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingName(true)}>
                <Pencil className="mr-2 h-3 w-3" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateBlock.mutate({ id: block.id, archived: true })} className="text-destructive">
                <Archive className="mr-2 h-3 w-3" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-0.5">
        {activeTasks.map(task => <TaskItem key={task.id} task={task} />)}
        {doneTasks.map(task => <TaskItem key={task.id} task={task} />)}
      </div>

      {addingTask ? (
        <div className="flex items-center gap-2">
          <Input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') setAddingTask(false); }}
            placeholder="Task title..."
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" onClick={handleCreateTask} className="h-8">Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAddingTask(false)} className="h-8">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground h-8" onClick={() => setAddingTask(true)}>
          <Plus className="mr-1 h-3 w-3" /> Add task
        </Button>
      )}
    </div>
  );
}
