import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Layers, ListChecks, Activity, CalendarDays, Sparkles } from 'lucide-react';
import shotVerticals from '@/assets/walkthrough/step1-verticals.jpg';
import shotTasks from '@/assets/walkthrough/step2-tasks.jpg';
import shotHealth from '@/assets/walkthrough/step3-health.jpg';
import shotCalendar from '@/assets/walkthrough/step4-calendar.jpg';
import shotAi from '@/assets/walkthrough/step5-ai.jpg';

const STEPS = [
  {
    icon: Layers,
    title: 'Organize life into Verticals',
    body: 'Verticals are the big areas of your life — Work, Health, Finance, Family. Each one gets its own tab and its own health score.',
    image: shotVerticals,
    alt: 'Helix home page showing verticals health cards',
  },
  {
    icon: ListChecks,
    title: 'Blocks and Tasks',
    body: 'Inside a vertical, Blocks group related work. Add tasks with deadlines, priorities (P1–P10) and long-form notes in the side drawer.',
    image: shotTasks,
    alt: 'A block inside a vertical with a task, deadline and priority, plus the Add Block button',
  },
  {
    icon: Activity,
    title: 'Health scores keep you honest',
    body: 'Every vertical scores 0–100 based on overdue and approaching deadlines. A quick glance shows which part of your life is slipping.',
    image: shotHealth,
    alt: 'Vertical health bar showing a percentage with overdue and urgent counters',
  },
  {
    icon: CalendarDays,
    title: 'Calendar and urgency',
    body: 'See everything by month, week or day, color-coded by vertical. The Home page surfaces your Top 5 most urgent tasks across all verticals.',
    image: shotCalendar,
    alt: 'Month calendar view with a color-coded task',
  },
  {
    icon: Sparkles,
    title: 'Ask the AI agent',
    body: 'Use the command bar next to Calendar to create tasks, blocks and verticals in plain language — it asks for anything it needs.',
    image: shotAi,
    alt: 'Ask Helix command bar in the navigation with a typed request',
  },
];

export function WalkthroughDialog() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [neverShow, setNeverShow] = useState(false);

  const settings = (profile?.settings as Record<string, unknown>) || {};
  const hidden = settings.hide_walkthrough === true;

  useEffect(() => {
    if (!user || !profile || hidden) return;
    const key = `helix_walkthrough_seen_${user.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setStep(0);
    setOpen(true);
  }, [user, profile, hidden]);

  const finish = async () => {
    setOpen(false);
    if (neverShow && user) {
      await supabase
        .from('profiles')
        .update({ settings: { ...settings, hide_walkthrough: true } })
        .eq('user_id', user.id);
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="sm:max-w-lg">
        <div className="space-y-5 pt-2">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={current.image}
              alt={current.alt}
              className="w-full object-cover"
              loading="eager"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{current.title}</h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-foreground' : 'bg-muted'}`}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox checked={neverShow} onCheckedChange={(c) => setNeverShow(c === true)} />
            Never show this again
          </label>

          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
              )}
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={() => (isLast ? finish() : setStep(step + 1))}
              >
                {isLast ? 'Get started' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}