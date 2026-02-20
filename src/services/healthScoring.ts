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
  score: number;          // 0–100
  overdueCount: number;
  urgentCount: number;    // due within 48h
}

const OVERDUE_MULTIPLIER = 3;
const URGENT_MULTIPLIER = 1.5;
const URGENT_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

export function calculateHealth(tasks: ScoredTask[], now = new Date()): HealthResult {
  let penalty = 0;
  let overdueCount = 0;
  let urgentCount = 0;

  const activeTasks = tasks.filter(t => t.status === 'active');

  for (const task of activeTasks) {
    if (!task.due_date) continue;
    const due = new Date(task.due_date);
    const diff = due.getTime() - now.getTime();

    if (diff < 0) {
      // overdue
      overdueCount++;
      penalty += task.importance_weight * OVERDUE_MULTIPLIER;
    } else if (diff <= URGENT_WINDOW_MS) {
      // urgent (within 48h)
      urgentCount++;
      penalty += task.importance_weight * URGENT_MULTIPLIER;
    }
  }

  const score = Math.max(0, Math.min(100, 100 - penalty));

  return { score, overdueCount, urgentCount };
}
