/**
 * Vertical Health Scoring Service
 * 
 * Modular scoring engine — swap formulas without touching the rest of the app.
 * Every function is pure: no side effects, easy to test.
 */

export interface ScoredTask {
  id: string;
  due_date: string | null;
  importance_weight: number;
  status: string;
  completed_at: string | null;
}

export interface HealthResult {
  score: number | null;   // 0–100, null when no tasks exist
  overdueCount: number;
  urgentCount: number;    // due within 48h
  hasActiveTasks: boolean;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const URGENT_WINDOW_MS = 48 * 60 * 60 * 1000;

export function calculateHealth(tasks: ScoredTask[], now = new Date()): HealthResult {
  let totalWeight = 0;
  let weightedPenalty = 0;
  let overdueCount = 0;
  let urgentCount = 0;

  const activeTasks = tasks.filter(t => t.status === 'active');

  if (activeTasks.length === 0) {
    return { score: null, overdueCount: 0, urgentCount: 0, hasActiveTasks: false };
  }

  for (const task of activeTasks) {
    totalWeight += task.importance_weight;

    if (!task.due_date) continue; // no deadline = no penalty
    const due = new Date(task.due_date);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) {
      // Overdue — heavy penalty that grows with days overdue (capped at full weight)
      overdueCount++;
      const daysOverdue = Math.abs(diff) / (24 * 60 * 60 * 1000);
      const overdueFactor = Math.min(1, 0.6 + daysOverdue * 0.1); // 60%-100%
      weightedPenalty += task.importance_weight * overdueFactor;
    } else if (diff <= URGENT_WINDOW_MS) {
      // Due within 48h — significant penalty
      urgentCount++;
      const ratio = 1 - diff / URGENT_WINDOW_MS; // 0 at 48h, 1 at 0h
      weightedPenalty += task.importance_weight * (0.3 + ratio * 0.25); // 30%-55%
    } else if (diff <= SEVEN_DAYS_MS) {
      // Due within a week — gradual ramp-up
      const ratio = 1 - diff / SEVEN_DAYS_MS; // 0 at 7d, 1 at 0d
      weightedPenalty += task.importance_weight * ratio * 0.3; // 0%-30%
    }
    // > 7 days: no penalty
  }

  const score = totalWeight > 0
    ? Math.max(0, Math.min(100, Math.round((1 - weightedPenalty / totalWeight) * 100)))
    : 100;

  return { score, overdueCount, urgentCount, hasActiveTasks: true };
}
