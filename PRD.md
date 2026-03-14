# Helix — Product Requirements Document

**Version:** 1.0  
**Date:** March 2026  
**Author:** Mor Bel  

---

## 1. Overview

Helix is a personal life management platform — a "Life Operating System" — that helps users organize their responsibilities across distinct life domains, track tasks with smart deadlines, and maintain awareness of what needs attention through a dynamic health scoring system.

---

## 2. Problem Statement

People juggle multiple life domains simultaneously (academics, work, fitness, personal projects) but lack a unified system that:

- Groups tasks by life domain rather than a single flat list.
- Surfaces the most urgent work automatically.
- Provides a measurable "health" indicator per domain so users know where they're falling behind.

---

## 3. Target Users

- University students managing coursework, jobs, and personal goals.
- Knowledge workers balancing multiple projects and responsibilities.
- Anyone seeking a structured, cross-domain task management approach.

---

## 4. Core Concepts

### 4.1 Verticals

Top-level life domains (e.g., "Degree", "Work", "Fitness"). Each vertical has:

| Attribute     | Description                                  |
|---------------|----------------------------------------------|
| Name          | User-defined label                           |
| Color         | Unique colour for visual identification      |
| Health Score  | Dynamic 0–100 score based on task deadlines  |
| Blocks        | One or more task groups within the vertical   |
| Archived      | Soft-delete flag                             |

### 4.2 Blocks

Groups of related tasks inside a vertical (e.g., individual courses, projects, or focus areas). Blocks are collapsible and support rename/delete via a context menu.

### 4.3 Tasks

Individual action items within a block.

| Attribute          | Description                                      |
|--------------------|--------------------------------------------------|
| Title              | Required. Editable inline.                       |
| Deadline           | Optional date + time. Defaults to 08:00 if unset.|
| Priority Weight    | P1–P10 (default P5). Higher = more impact.       |
| Status             | `active` or `done`                               |
| Notes              | Multiple free-text notes per task                |
| Description        | Optional longer description                      |

**Behaviours:**
- Auto-sorted by deadline proximity (most urgent first).
- Completed tasks collapse into a "Done" section per block.
- Inline editing for title, deadline, and priority.

### 4.4 Task Notes

Each task supports multiple timestamped notes accessible via a side drawer. Tasks with notes display a badge count.

---

## 5. Health Score System

Every vertical has a real-time health score (0–100) derived from its active tasks with deadlines.

### 5.1 Scoring Rules

| Time to Deadline | Impact                                         |
|------------------|-------------------------------------------------|
| 7+ days          | No penalty                                      |
| 1–7 days         | Gradual decrease as deadline approaches          |
| Under 48 hours   | Significant penalty; flagged as urgent           |
| Overdue          | Major penalty; grows with each overdue day       |

### 5.2 Modifiers

- **Priority weight** amplifies the penalty (P10 task overdue hurts far more than P1).
- Tasks without deadlines have zero health impact.
- Completed tasks are excluded from scoring.

### 5.3 Visual Indicators

- Health bar with colour gradient: green (high) → yellow (medium) → red (low).
- Displayed on the Home dashboard per vertical.

---

## 6. Priority Weight (P1–P10)

| Range     | Label    | Impact on Health & Urgency |
|-----------|----------|----------------------------|
| P1–P3     | Low      | Minor                      |
| P4–P6     | Medium   | Moderate                   |
| P7–P8     | High     | Strong                     |
| P9–P10    | Critical | Maximum                    |

Priority weight influences both the health score penalty and the urgency ranking on the dashboard.

---

## 7. Pages & Navigation

### 7.1 Home Dashboard

- Displays health bars for all verticals.
- Lists the **top 5 most urgent tasks** across all verticals.
- Urgency ranking = time pressure × priority weight.
- Clicking an urgent task navigates to it in its vertical.

### 7.2 Vertical Page

- Shows all blocks and tasks for a selected vertical.
- Supports creating, editing, and completing tasks.
- Block-level actions: rename, delete, collapse/expand.

### 7.3 Calendar View

- Monthly / weekly / daily views.
- Tasks with deadlines are colour-coded by vertical.
- Clicking a task navigates to it in context.

### 7.4 Helix Wiki (How It Works)

- In-app documentation with anchor-link table of contents.
- Covers: Structure, Tasks, Health Score, Priority Weight, Calendar, Task Notes, Dashboard, Settings.

### 7.5 About Page

- Product description and creator attribution.

### 7.6 Settings (via Hamburger Menu)

- **Theme:** Dark / Light mode toggle.
- **Time format:** 12-hour / 24-hour.
- **Vertical management:** Rename, re-colour, archive.
- **Account:** Update display name, sign out.

---

## 8. AI Chat Agent

An inline AI assistant embedded in the navigation bar. Users can ask questions about their tasks, get suggestions, and interact conversationally. The chat panel expands from a compact command bar.

---

## 9. Authentication

- Email + password signup and login.
- Email verification required before access.
- Password reset flow via email link.
- Privacy policy available at signup.

---

## 10. Technical Architecture

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React + Vite + TypeScript           |
| Styling        | Tailwind CSS + shadcn/ui            |
| State          | TanStack React Query                |
| Backend        | Lovable Cloud (Supabase)            |
| Auth           | Lovable Cloud Auth                  |
| Database       | PostgreSQL (via Lovable Cloud)      |
| Edge Functions | Deno (task-chat, check-email-exists)|
| Animations     | CSS transitions + canvas-confetti   |

### 10.1 Database Schema

```
verticals (id, user_id, name, color, description, order_index, archived, created_at)
  └── blocks (id, vertical_id, name, description, order_index, archived, created_at)
       └── tasks (id, block_id, title, description, due_date, importance_weight, status, completed_at, created_at, updated_at)
            └── task_notes (id, task_id, content, created_at, updated_at)

profiles (id, user_id, name, settings, timezone, created_at)
```

### 10.2 Security

- Row-Level Security (RLS) on all tables.
- Users can only access their own data.
- No client-side role/admin checks.

---

## 11. Non-Functional Requirements

| Requirement    | Target                              |
|----------------|-------------------------------------|
| Responsiveness | Mobile-first, works on all devices  |
| Performance    | < 2s initial load                   |
| Accessibility  | Semantic HTML, keyboard navigation  |
| Theme support  | Light and dark modes                |
| Data privacy   | User data isolated via RLS          |

---

## 12. Future Considerations

- **Outlook/Google Calendar integration** — sync meetings as tasks (OAuth or ICS import).
- **Recurring tasks** — daily/weekly/monthly repeat patterns.
- **Collaboration** — shared verticals or blocks.
- **Mobile app** — React Native or PWA.
- **Analytics dashboard** — completion trends, health history over time.
- **Notifications** — deadline reminders via email or push.

---

## 13. Success Metrics

- Daily active usage (tasks created/completed per session).
- Health score maintenance (average score across verticals over time).
- User retention (weekly return rate).
- Task completion rate.
