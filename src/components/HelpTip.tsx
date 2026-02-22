import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

interface HelpTipProps {
  children: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HelpTip({ children, side = 'right' }: HelpTipProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex" aria-label="Help">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
          </button>
        </PopoverTrigger>
        <PopoverContent side={side} className="max-w-[220px] text-xs p-3">
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[220px] text-xs">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
