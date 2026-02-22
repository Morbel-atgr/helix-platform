import { useState } from 'react';
import { useTaskNotes, useCreateTaskNote, useUpdateTaskNote, useDeleteTaskNote } from '@/hooks/useTaskNotes';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskNotesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
}

export function TaskNotesDrawer({ open, onOpenChange, taskId, taskTitle }: TaskNotesDrawerProps) {
  const { data: notes = [], isLoading } = useTaskNotes(open ? taskId : undefined);
  const createNote = useCreateTaskNote();
  const updateNote = useUpdateTaskNote();
  const deleteNote = useDeleteTaskNote();

  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreate = () => {
    if (!newContent.trim()) return;
    createNote.mutate({ task_id: taskId, content: newContent.trim() });
    setNewContent('');
    setAdding(false);
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) return;
    updateNote.mutate({ id, content: editContent.trim(), task_id: taskId });
    setEditingId(null);
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-base font-semibold truncate pr-6">
            Notes — {taskTitle}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : notes.length === 0 && !adding ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground/70">Add a note to keep track of details, progress, or context.</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="group rounded-lg border border-border bg-card p-3 space-y-2">
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="min-h-[80px] text-sm"
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => handleUpdate(note.id)} className="h-7 text-xs gap-1">
                        <Check className="h-3 w-3" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap text-foreground">{note.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
                        {note.updated_at !== note.created_at && ' (edited)'}
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(note.id, note.content)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete note?</AlertDialogTitle>
                              <AlertDialogDescription>This note will be permanently deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteNote.mutate({ id: note.id, task_id: taskId })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add note area pinned to bottom */}
        <div className="pt-3 border-t border-border">
          {adding ? (
            <div className="space-y-2">
              <Textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Write a note..."
                className="min-h-[80px] text-sm"
                autoFocus
              />
              <div className="flex gap-1.5">
                <Button size="sm" onClick={handleCreate} disabled={!newContent.trim()} className="h-8 text-xs gap-1">
                  <Check className="h-3 w-3" /> Save Note
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewContent(''); }} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
