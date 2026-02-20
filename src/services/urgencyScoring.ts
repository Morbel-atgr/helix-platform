/**
 * Urgency Scoring Service
 * 
 * Ranks tasks by urgency for the global dashboard.
 * Pure functions — easily swappable scoring formula.
 */

export interface UrgencyTask {
  id: string;
  title: string;
  due_date: string | null;
  importance_weight: number;
  status: string;
  block_id: string;
  vertical_name?: string;
  vertical_color?: string;
}

export interface RankedTask extends UrgencyTask {
  urgencyScore: number;
}

export function calculateUrgencyScore(task: UrgencyTask, now = new Date()): number {
  if (!task.due_date || task.status === 'done') return 0;

  const due = new Date(task.due_date);
  const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  let timeScore = 0;
  if (hoursUntilDue < 0) {
    // Overdue: higher urgency the more overdue
    timeScore = 100 + Math.min(Math.abs(hoursUntilDue), 200);
  } else if (hoursUntilDue <= 48) {
    timeScore = 80 - (hoursUntilDue / 48) * 60;
  } else if (hoursUntilDue <= 168) {
    timeScore = 20 - (hoursUntilDue / 168) * 15;
  }

  return Math.max(0, timeScore * (task.importance_weight / 5));
}

export function getTopUrgentTasks(tasks: UrgencyTask[], count = 5, now = new Date()): RankedTask[] {
  return tasks
    .filter(t => t.status === 'active')
    .map(t => ({ ...t, urgencyScore: calculateUrgencyScore(t, now) }))
    .filter(t => t.urgencyScore > 0)
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, count);
}
