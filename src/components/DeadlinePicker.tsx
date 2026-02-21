import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTimeFormat } from '@/hooks/useTimeFormat';

interface DeadlinePickerProps {
  selected?: Date;
  onSelect: (date: Date | null) => void;
  disablePast?: boolean;
  showRemove?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DeadlinePicker({ selected, onSelect, disablePast = false, showRemove = false }: DeadlinePickerProps) {
  const [hour, setHour] = useState<number>(selected ? selected.getHours() : 8);
  const { formatHour } = useTimeFormat();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    date.setHours(hour, 0, 0, 0);
    onSelect(date);
  };

  const handleHourChange = (val: string) => {
    const h = parseInt(val);
    setHour(h);
    if (selected) {
      const updated = new Date(selected);
      updated.setHours(h, 0, 0, 0);
      onSelect(updated);
    }
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleDateSelect}
        initialFocus
        className={cn('p-3 pointer-events-auto')}
        disabled={disablePast ? (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
      />
      <div className="px-3 pb-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Time:</span>
        <Select value={String(hour)} onValueChange={handleHourChange}>
          <SelectTrigger className="h-7 text-xs w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {HOURS.map(h => (
              <SelectItem key={h} value={String(h)} className="text-xs">
                {formatHour(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showRemove && (
        <div className="px-3 pb-3 border-t pt-2">
          <Button variant="ghost" size="sm" className="w-full text-xs text-destructive" onClick={() => onSelect(null)}>
            Remove deadline
          </Button>
        </div>
      )}
    </div>
  );
}
