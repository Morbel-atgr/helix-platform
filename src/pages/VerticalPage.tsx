import { useBlocks, useCreateBlock, useUpdateBlock } from '@/hooks/useBlocks';
import { useAllTasks } from '@/hooks/useTasks';
import { VerticalHealth } from '@/components/VerticalHealth';
import { BlockCard } from '@/components/BlockCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { calculateHealth } from '@/services/healthScoring';
import { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';

interface VerticalPageProps {
  vertical: {
    id: string;
    name: string;
    color: string | null;
  };
  highlightTaskId?: string | null;
}

export function VerticalPage({ vertical, highlightTaskId }: VerticalPageProps) {
  const { data: blocks = [] } = useBlocks(vertical.id);
  const blockIds = blocks.map(b => b.id);
  const { data: allTasks = [] } = useAllTasks(blockIds);
  const createBlock = useCreateBlock();
  const updateBlock = useUpdateBlock();
  const queryClient = useQueryClient();

  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');

  const health = useMemo(() => calculateHealth(allTasks), [allTasks]);

  const handleCreateBlock = () => {
    if (!newBlockName.trim()) return;
    createBlock.mutate({ vertical_id: vertical.id, name: newBlockName.trim() });
    setNewBlockName('');
    setAddingBlock(false);
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return;

    const reordered = Array.from(blocks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Optimistic update
    queryClient.setQueryData(['blocks', vertical.id], reordered.map((b, i) => ({ ...b, order_index: i })));

    // Persist all changed positions
    reordered.forEach((block, index) => {
      if (block.order_index !== index) {
        updateBlock.mutate({ id: block.id, order_index: index });
      }
    });
  }, [blocks, vertical.id, queryClient, updateBlock]);

  return (
    <div className="space-y-6 animate-slide-up">
      <VerticalHealth health={health} verticalName={vertical.name} />

      {blocks.length === 0 && !addingBlock ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-muted-foreground text-sm">No blocks yet. Create your first block to start organizing tasks.</p>
          <Button onClick={() => setAddingBlock(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Add Your First Block
          </Button>
        </div>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start"
                >
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? 'opacity-90 rotate-1 scale-[1.02] transition-transform' : ''}
                        >
                          <BlockCard
                            block={block}
                            highlightTaskId={highlightTaskId}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {addingBlock ? (
            <div className="flex items-center gap-2 max-w-sm">
              <Input
                value={newBlockName}
                onChange={e => setNewBlockName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateBlock(); if (e.key === 'Escape') { setAddingBlock(false); setNewBlockName(''); } }}
                placeholder="Block name..."
                autoFocus
                className="h-9"
              />
              <Button size="sm" onClick={handleCreateBlock} className="shrink-0">Create</Button>
              <Button size="sm" variant="ghost" className="shrink-0" onClick={() => { setAddingBlock(false); setNewBlockName(''); }}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <button
              onClick={() => setAddingBlock(true)}
              className="w-full border-2 border-dashed border-border/60 hover:border-primary/40 rounded-lg py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all group"
            >
              <Plus className="h-4 w-4 group-hover:text-primary transition-colors" />
              Add Block
            </button>
          )}
        </>
      )}
    </div>
  );
}
