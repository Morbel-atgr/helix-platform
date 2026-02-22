import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Heart, AlertTriangle, Clock, TrendingDown, Weight,
  Layers, LayoutGrid, CheckSquare, StickyNote, CalendarDays,
  Settings, Moon, Sun, Palette, BarChart3, Home
} from 'lucide-react';

interface HowItWorksProps {
  onBack: () => void;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 space-y-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

export function HowItWorks({ onBack }: HowItWorksProps) {
  return (
    <div className="space-y-6 animate-slide-up max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Helix Wiki</h1>
          <p className="text-xs text-muted-foreground">Everything you need to know about Helix.</p>
        </div>
      </div>

      {/* Table of Contents */}
      <nav className="glass-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contents</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-primary">
          {['Structure', 'Tasks', 'Health Score', 'Priority Weight', 'Calendar', 'Task Notes', 'Dashboard', 'Settings'].map((s) => (
            <a key={s} href={`#${s.toLowerCase().replace(/ /g, '-')}`} className="hover:underline underline-offset-2">
              {s}
            </a>
          ))}
        </div>
      </nav>

      <Separator />

      {/* ── Structure ── */}
      <div id="structure" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Structure</h3>

        <Section icon={Layers} title="Verticals">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Verticals are top-level life domains — think "Degree", "Work", or "Fitness". Each vertical has its own colour, health score, and contains one or more blocks. You can create, rename, re-colour, or archive verticals from the sidebar menu.
          </p>
        </Section>

        <Section icon={LayoutGrid} title="Blocks">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Blocks are groups of related tasks inside a vertical — like individual courses, projects, or focus areas. They're collapsible for a clean overview. Use the three-dot menu on each block to rename or delete it.
          </p>
        </Section>
      </div>

      <Separator />

      {/* ── Tasks ── */}
      <div id="tasks" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</h3>

        <Section icon={CheckSquare} title="Tasks">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tasks are individual action items that live inside blocks. Each task can have a title, an optional deadline (with a specific time), and a priority weight (P1–P10).
          </p>
          <div className="space-y-2">
            <Item label="Deadlines">
              Set a due date and time for any task. Defaults to 8:00 AM if no time is specified. Deadlines drive the health score and urgency ranking.
            </Item>
            <Item label="Auto-sorting">
              Active tasks are automatically sorted by how close they are to their deadline — the most urgent float to the top.
            </Item>
            <Item label="Completion">
              Check a task to mark it done. Completed tasks move into a collapsible "Done" section at the bottom of each block, keeping the active list clean.
            </Item>
            <Item label="Inline editing">
              Tap a task's title, deadline, or priority badge to edit it in place. No modals required.
            </Item>
          </div>
        </Section>
      </div>

      <Separator />

      {/* ── Health Score ── */}
      <div id="health-score" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Score</h3>

        <Section icon={Heart} title="Health Score (0–100)">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every vertical has a dynamic health score that reflects how well you're keeping up. It starts at <strong className="text-foreground">100</strong> and decreases based on how close active tasks are to their deadlines.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <span className="mt-0.5 text-primary">✅</span>
              <div>
                <p className="text-sm font-medium text-foreground">7+ days away</p>
                <p className="text-xs text-muted-foreground">No penalty. Health stays high.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 mt-0.5 text-health-medium flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">1–7 days away</p>
                <p className="text-xs text-muted-foreground">Gradual decrease as the deadline approaches.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <TrendingDown className="h-4 w-4 mt-0.5 text-health-low flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Under 48 hours</p>
                <p className="text-xs text-muted-foreground">Significant penalty. Flagged as urgent on the dashboard.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Overdue</p>
                <p className="text-xs text-muted-foreground">Major hit. Penalty grows with each day past the deadline.</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tasks without a deadline don't affect health. Completed tasks are excluded.
          </p>
        </Section>
      </div>

      <Separator />

      {/* ── Priority Weight ── */}
      <div id="priority-weight" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Weight</h3>

        <Section icon={Weight} title="Priority Weight (P1–P10)">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every task has a priority weight from 1 to 10 (default: P5). Higher weight means the task has a bigger impact on your health score and ranks higher in the urgency list.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Item label="Low (P1–P3)">Minor impact. Nice-to-have items.</Item>
            <Item label="Medium (P4–P6)">Moderate impact. Regular tasks.</Item>
            <Item label="High (P7–P8)">Strong impact. Important deadlines.</Item>
            <Item label="Critical (P9–P10)">Maximum impact. Missing these tanks your health.</Item>
          </div>
        </Section>
      </div>

      <Separator />

      {/* ── Calendar ── */}
      <div id="calendar" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calendar</h3>

        <Section icon={CalendarDays} title="Calendar View">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Calendar tab shows all tasks with deadlines laid out across a monthly, weekly, or daily view. Tasks are colour-coded by their vertical. Click any task to jump straight to it in the correct vertical.
          </p>
        </Section>
      </div>

      <Separator />

      {/* ── Task Notes ── */}
      <div id="task-notes" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task Notes</h3>

        <Section icon={StickyNote} title="Task Notes">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every task can have multiple free-text notes. Click the sticky-note icon on a task to open a side drawer where you can add, edit, or delete notes. Tasks with notes show a small badge with the count.
          </p>
        </Section>
      </div>

      <Separator />

      {/* ── Dashboard ── */}
      <div id="dashboard" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</h3>

        <Section icon={Home} title="Home Dashboard">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Home tab gives you a cross-domain overview. It shows the health bars of every vertical and lists your <strong className="text-foreground">top 5 most urgent tasks</strong> across all verticals. Urgency ranking combines time pressure with priority weight so the most important work always surfaces first. Clicking an urgent task takes you directly to it.
          </p>
        </Section>
      </div>

      <Separator />

      {/* ── Settings ── */}
      <div id="settings" className="scroll-mt-24 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h3>

        <Section icon={Settings} title="Preferences">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Open the hamburger menu (top-left) to access your settings and account.
          </p>
          <div className="space-y-2">
            <Item label="Dark / Light Mode">
              Toggle between dark and light themes. Your preference is remembered across sessions.
            </Item>
            <Item label="Time Format">
              Switch between 12-hour (AM/PM) and 24-hour time display. Applies globally to all deadline displays throughout the app.
            </Item>
            <Item label="Vertical Management">
              Rename, re-colour, or archive verticals directly from the sidebar's Verticals section.
            </Item>
            <Item label="Account">
              Update your display name or sign out.
            </Item>
          </div>
        </Section>
      </div>
    </div>
  );
}
