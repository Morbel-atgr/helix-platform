import { useBlocks, useCreateBlock } from '@/hooks/useBlocks';
import { useAllTasks } from '@/hooks/useTasks';
import { VerticalHealth } from '@/components/VerticalHealth';
import { BlockCard } from '@/components/BlockCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { calculateHealth } from '@/services/healthScoring';
import { useState, useMemo } from 'react';

interface VerticalPageProps {
  vertical: {
    id: string;
    name: string;
    color: string | null;
  };
}

export function VerticalPage({ vertical }: VerticalPageProps) {
  const { data: blocks = [] } = useBlocks(vertical.id);
  const blockIds = blocks.map(b => b.id);
  const { data: allTasks = [] } = useAllTasks(blockIds);
  const createBlock = useCreateBlock();

  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');

  const health = useMemo(() => calculateHealth(allTasks), [allTasks]);

  const handleCreateBlock = () => {
    if (!newBlockName.trim()) return;
    createBlock.mutate({ vertical_id: vertical.id, name: newBlockName.trim() });
    setNewBlockName('');
    setAddingBlock(false);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map(block => (
            <BlockCard key={block.id} block={block} />
          ))}

          {addingBlock ? (
            <div className="glass-card p-4 space-y-3">
              <Input
                value={newBlockName}
                onChange={e => setNewBlockName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateBlock(); if (e.key === 'Escape') setAddingBlock(false); }}
                placeholder="Block name..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateBlock}>Create</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingBlock(false)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingBlock(true)}
              className="glass-card p-4 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors min-h-[120px]"
            >
              <Plus className="h-5 w-5" /> Add Block
            </button>
          )}
        </div>
      )}
    </div>
  );
}
