import { useState } from 'react';
import { useCreateVertical } from '@/hooks/useVerticals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

const COLORS = ['#2dd4bf', '#f472b6', '#fb923c', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

export function CreateVerticalDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const create = useCreateVertical();

  const handleCreate = () => {
    if (!name.trim()) return;
    create.mutate({ name: name.trim(), color }, {
      onSuccess: () => { setOpen(false); setName(''); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-3">
          <Plus className="h-4 w-4 mr-1" /> Vertical
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Vertical</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Work, Health, Finance..." onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
