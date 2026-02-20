import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVerticals } from '@/hooks/useVerticals';
import { HomePage } from './HomePage';
import { VerticalPage } from './VerticalPage';
import { CreateVerticalDialog } from '@/components/CreateVerticalDialog';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { signOut } = useAuth();
  const { data: verticals = [] } = useVerticals();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const activeVertical = verticals.find(v => v.id === activeTab);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold tracking-tight mr-4">
                <span className="text-gradient">Helix</span>
              </h1>

              {/* Tabs */}
              <nav className="flex items-center gap-0.5 overflow-x-auto">
                <button
                  onClick={() => setActiveTab(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
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
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5',
                      activeTab === v.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color || 'hsl(var(--primary))' }} />
                    {v.name}
                  </button>
                ))}

                <CreateVerticalDialog />
              </nav>
            </div>

            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === null || !activeVertical ? (
          <HomePage />
        ) : (
          <VerticalPage key={activeVertical.id} vertical={activeVertical} />
        )}
      </main>
    </div>
  );
}
