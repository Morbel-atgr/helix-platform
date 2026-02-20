import { useState } from 'react';
import { useVerticals } from '@/hooks/useVerticals';
import { HomePage } from './HomePage';
import { VerticalPage } from './VerticalPage';
import { HowItWorks } from './HowItWorks';
import { About } from './About';
import { CalendarPage } from './CalendarPage';
import { CreateVerticalDialog } from '@/components/CreateVerticalDialog';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Home, Activity, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: verticals = [] } = useVerticals();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [page, setPage] = useState<'main' | 'how-it-works' | 'about' | 'calendar'>('main');
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);

  const handleNavigateToTask = (verticalId: string, taskId: string) => {
    setActiveTab(verticalId);
    setPage('main');
    setHighlightTaskId(taskId);
  };

  const activeVertical = verticals.find(v => v.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background border-b border-border overflow-visible">
        <div className="max-w-6xl mx-auto px-6 overflow-visible">
          {/* Row 1: Brand + actions */}
          <div className="flex items-center justify-between py-3 overflow-visible">
            <div className="flex items-center gap-2 overflow-visible">
              <HamburgerMenu
                onSelectVertical={(id) => { setActiveTab(id); setPage('main'); }}
                onNavigate={(p) => { setPage(p as any); setActiveTab(null); }}
              />
              <span className="iridescent-text overflow-visible block pb-4" style={{ fontFamily: "'Bumbbled', cursive", lineHeight: 1, fontSize: '1.4rem', position: 'relative', top: '4px' }}>Helix</span>
            </div>
          </div>

          {/* Row 2: Tabs */}
          <nav className="flex items-center gap-1 pb-2 -mb-px overflow-x-auto">
            <button
              onClick={() => { setActiveTab(null); setPage('main'); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === null && page === 'main'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </button>

            {verticals.map(v => (
              <button
                key={v.id}
                onClick={() => { setActiveTab(v.id); setPage('main'); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                  activeTab === v.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                {v.name}
              </button>
            ))}

            <CreateVerticalDialog />

            <div className="flex-1" />

            <button
              onClick={() => { setActiveTab(null); setPage('calendar'); }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                page === 'calendar'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div key={`${page}-${activeTab}`} className="animate-fade-in">
          {page === 'calendar' ? (
            <CalendarPage />
          ) : page === 'how-it-works' ? (
            <HowItWorks onBack={() => setPage('main')} />
          ) : page === 'about' ? (
            <About onBack={() => setPage('main')} />
          ) : activeTab === null || !activeVertical ? (
            <HomePage onNavigateToTask={handleNavigateToTask} onNavigateToVertical={(id) => { setActiveTab(id); setPage('main'); }} />
          ) : (
            <VerticalPage key={activeVertical.id} vertical={activeVertical} highlightTaskId={highlightTaskId} />
          )}
        </div>
      </main>
    </div>
  );
}
