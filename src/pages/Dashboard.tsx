import { useState } from 'react';
import { useVerticals } from '@/hooks/useVerticals';
import { HomePage } from './HomePage';
import { VerticalPage } from './VerticalPage';
import { CreateVerticalDialog } from '@/components/CreateVerticalDialog';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import helixLogo from '@/assets/helix-logo.png';

export default function Dashboard() {
  const { data: verticals = [] } = useVerticals();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const activeVertical = verticals.find(v => v.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <HamburgerMenu />

              <div className="flex items-center gap-2.5">
                <img src={helixLogo} alt="Helix" className="h-9 w-9 rounded-lg" />
                <h1 className="text-2xl font-brand text-gradient">
                  Helix
                </h1>
              </div>
            </div>

            {/* Center/Right: Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab(null)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-mono font-bold transition-colors whitespace-nowrap',
                  activeTab === null
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Home className="h-4 w-4 inline mr-1.5" />
                Home
              </button>

              {verticals.map(v => (
                <button
                  key={v.id}
                  onClick={() => setActiveTab(v.id)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-mono font-bold transition-colors whitespace-nowrap flex items-center gap-1.5',
                    activeTab === v.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                  {v.name}
                </button>
              ))}

              <CreateVerticalDialog />
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === null || !activeVertical ? (
          <HomePage />
        ) : (
          <VerticalPage key={activeVertical.id} vertical={activeVertical} />
        )}
      </main>
    </div>
  );
}
