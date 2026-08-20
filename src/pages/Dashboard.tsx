import { useState } from 'react';
import { useVerticals } from '@/hooks/useVerticals';
import { HomePage } from './HomePage';
import { VerticalPage } from './VerticalPage';
import { HowItWorks } from './HowItWorks';
import { About } from './About';
import { PrivacyPolicy } from './PrivacyPolicy';
import { CalendarPage } from './CalendarPage';
import { CreateVerticalDialog } from '@/components/CreateVerticalDialog';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Home, Activity, CalendarDays } from 'lucide-react';
import { AiChatAgent } from '@/components/AiChatAgent';
import { WalkthroughDialog } from '@/components/WalkthroughDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const { data: verticals = [] } = useVerticals();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [page, setPage] = useState<'main' | 'how-it-works' | 'about' | 'calendar' | 'privacy'>('main');
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);

  const handleNavigateToTask = (verticalId: string, taskId: string) => {
    setActiveTab(verticalId);
    setPage('main');
    setHighlightTaskId(taskId);
  };

  const activeVertical = verticals.find((v) => v.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <WalkthroughDialog />
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background border-b border-border overflow-visible">
        <div className="max-w-6xl mx-auto px-6 overflow-visible">
          {/* Row 1: Hamburger + centered Brand */}
          <div className="flex items-center py-3 gap-1">
            <HamburgerMenu
              onSelectVertical={(id) => {setActiveTab(id);setPage('main');}}
              onNavigate={(p) => {setPage(p as any);setActiveTab(null);}} />

            <button 
              onClick={(e) => {
                setActiveTab(null); setPage('main');
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                confetti({
                  particleCount: 25,
                  spread: 50,
                  startVelocity: 15,
                  gravity: 0.8,
                  scalar: 0.6,
                  ticks: 80,
                  origin: { x, y },
                  colors: ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'],
                });
              }}
              className="iridescent-text overflow-visible font-normal text-3xl pr-[5px] pt-[4px] pl-0 mx-0 pb-px hover:opacity-80 transition-opacity cursor-pointer active:scale-95" 
              style={{ fontFamily: "'Bumbbled', cursive", lineHeight: 1.4, fontSize: '2.1rem', fontWeight: 'normal' }}
            >
              Helix
            </button>
          </div>

          {/* Row 2: Tabs */}
          <nav className="flex items-center gap-1 pb-2 -mb-px overflow-x-auto">
            <button
              onClick={() => {setActiveTab(null);setPage('main');}}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === null && page === 'main' ?
                'bg-muted text-foreground' :
                'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}>

              <Home className="h-3.5 w-3.5" />
              Home
            </button>

            {verticals.map((v) =>
            <button
              key={v.id}
              onClick={() => {setActiveTab(v.id);setPage('main');}}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                activeTab === v.id ?
                'bg-muted text-foreground' :
                'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}>

                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                {v.name}
              </button>
            )}

            <CreateVerticalDialog />

            <div className="flex-1" />

            <AiChatAgent />

            <button
              onClick={() => {setActiveTab(null);setPage('calendar');}}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                page === 'calendar' ?
                'bg-muted text-foreground' :
                'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}>

              <CalendarDays className="h-3.5 w-3.5" />
              Calendar
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div key={`${page}-${activeTab}`} className="animate-fade-in pl-0">
          {page === 'calendar' ?
          <CalendarPage onTaskClick={handleNavigateToTask} /> :
          page === 'how-it-works' ?
          <HowItWorks onBack={() => setPage('main')} /> :
          page === 'about' ?
          <About onBack={() => setPage('main')} /> :
          page === 'privacy' ?
          <PrivacyPolicy onBack={() => setPage('main')} /> :
          activeTab === null || !activeVertical ?
          <HomePage onNavigateToTask={handleNavigateToTask} onNavigateToVertical={(id) => {setActiveTab(id);setPage('main');}} /> :

          <VerticalPage key={activeVertical.id} vertical={activeVertical} highlightTaskId={highlightTaskId} />
          }
        </div>
      </main>



    </div>);

}