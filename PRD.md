# Helix — Product Requirements Document

**Version:** 2.0
**Date:** August 2026
**Author:** Mor Bel
**Status:** Living document — reflects the product as currently built

---

## 1. Executive Summary

Helix is a personal "Life Operating System": a web application that replaces the flat to-do list with a three-level structure of life domains, project groupings, and tasks, then continuously scores each domain's health so users can see — at a glance — which part of their life is being neglected.

Helix answers a single question every time it is opened: **"What deserves my attention right now, and what am I quietly letting slip?"**

---

## 2. Problem Statement

### 2.1 The problem

Modern life is fragmented across parallel domains — a degree, a job, fitness, finances, side projects, family. Existing tools fail in three specific ways:

1. **Flat lists lose context.** A single list of 60 items mixes "submit thesis chapter" with "buy milk". Domain boundaries disappear, and so does the sense of proportion.
2. **Decision fatigue.** Users spend cognitive effort re-deciding what to work on every single session, because nothing ranks work for them.
3. **Invisible neglect.** Nothing tells a user that they have not touched their Fitness domain for three weeks. Neglect is silent until it becomes a crisis.

### 2.2 The Helix solution

| Problem | Helix mechanism |
|---|---|
| Flat lists lose context | Verticals → Blocks → Tasks hierarchy, colour-coded per domain |
| Decision fatigue | Automatic urgency ranking; the Top 5 Urgent Tasks list is computed, never curated |
| Invisible neglect | A 0–100 Health Score per vertical, always visible on the home dashboard |
| Deadline blindness | Calendar view across all domains plus deadline-proximity penalties |
| Friction of data entry | Conversational AI agent that creates verticals, blocks, and tasks from plain language |

---

## 3. Target Users

- **University students** juggling coursework, part-time work, and personal goals.
- **Knowledge workers** balancing several concurrent projects and responsibilities.
- **Multi-domain individuals** who want structural awareness rather than a longer list.

---

## 4. Core Concepts and Data Model

Helix has exactly one hierarchy. Everything in the product is an expression of it.

```text
Vertical  (life domain, e.g. "Degree")
  └── Block  (grouping, e.g. "Statistics 101")
        └── Task  (action item, e.g. "Submit problem set 4")
              └── Note  (free-text, timestamped, many per task)
```

### 4.1 Verticals

A vertical is a top-level life domain.

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| user_id | UUID | Owner; cascade-deletes with the account |
| name | Text | Required, user-defined |
| description | Text | Optional |
| color | Text | Hex colour chosen from an 8-swatch preset palette |
| order_index | Integer | Drag-and-drop ordering on the dashboard; defaults to 0 |
| archived | Boolean | Soft-delete flag, default false |
| created_at | Timestamptz | Auto |

**Functions:** create (name + colour), recolour, delete (cascades to all blocks, tasks, notes, with confirmation), reorder by drag and drop on the home dashboard, navigate to via tab bar or dashboard card.

### 4.2 Blocks

A block groups related tasks inside a vertical — a course, a project, a focus area.

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key |
| vertical_id | UUID | Parent; cascade delete |
| name | Text | Required |
| description | Text | Optional |
| order_index | Integer | Drag-and-drop ordering within the vertical |
| archived | Boolean | Default false |
| created_at | Timestamptz | Auto |

**Functions:** create via a full-width dashed "Add Block" card, inline rename, delete with confirmation dialog (cascades to tasks), collapse/expand, drag to reorder, inline "add task" form with deadline picker.

### 4.3 Tasks

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key |
| block_id | UUID | Parent; cascade delete |
| title | Text | Required; editable inline |
| description | Text | Optional |
| due_date | Timestamptz | Optional date + hour |
| importance_weight | Integer | Priority P1–P10, default P5 |
| status | Enum | `active` or `done` |
| completed_at | Timestamptz | Set when marked done |
| created_at / updated_at | Timestamptz | `updated_at` maintained by a database trigger |

**Functions:**

- Checkbox toggles active/done; completing a task fires a confetti burst and stamps `completed_at`.
- Inline title editing.
- Deadline popover: calendar + hour selector, respecting the user's 24h / AM-PM preference; deadline can be removed.
- Priority popover: a 1–10 grid selector.
- Notes button with a live badge count, opening the notes drawer.
- Delete with confirmation dialog.
- Active tasks are sorted by deadline proximity; completed tasks collapse into a per-block "Done" section.
- When navigated to from the dashboard or calendar, the task scrolls into view and pulses to highlight itself.

### 4.4 Task Notes

Long-form free text attached to a task, shown in a right-side drawer.

| Field | Type | Rules |
|---|---|---|
| id | UUID | Primary key |
| task_id | UUID | Parent; cascade delete |
| content | Text | Required |
| created_at / updated_at | Timestamptz | `updated_at` maintained by trigger |

**Functions:** add unlimited notes per task, edit in place, delete with confirmation, timestamps with an "(edited)" indicator, badge count surfaced on the task row.

### 4.5 Profile

| Field | Type | Rules |
|---|---|---|
| id / user_id | UUID | One profile per authenticated user, created automatically on signup |
| name | Text | Display name, editable in Settings |
| timezone | Text | Defaults to UTC (displayed read-only today) |
| settings | JSONB | Holds `time_format` (`24h` default, or `12h`) |
| created_at | Timestamptz | Auto |

A database trigger creates the profile on account creation, seeding `name` from signup metadata or the email local part.

---

## 5. Health Score System

Every vertical carries a live 0–100 health score derived from the deadline pressure of its active tasks, weighted by priority.

### 5.1 Formula

Let `W` be the sum of `importance_weight` across all active tasks in the vertical, and `P` the accumulated weighted penalty. For each active task:

| Deadline state | Penalty applied |
|---|---|
| No deadline | 0 |
| More than 7 days away | 0 |
| Within 7 days | `weight × (1 − diff/7d) × 0.30` → ramps 0% to 30% |
| Within 48 hours | `weight × (0.30 + (1 − diff/48h) × 0.25)` → 30% to 55% |
| Overdue | `weight × min(1, 0.60 + daysOverdue × 0.10)` → 60% to 100% |

`score = clamp(0, 100, round((1 − P / W) × 100))`

If the vertical has no active tasks, the score is null (an empty state is shown rather than a misleading 100). Completed tasks are always excluded.

### 5.2 Derived counters

Alongside the score, each vertical reports **Overdue count** and **Urgent count** (tasks due within 48 hours).

### 5.3 Visual language

| Score | Label | Bar colour |
|---|---|---|
| 90–100 | Excellent | Green |
| 70–89 | Good | Green |
| 50–69 | Fair | Amber |
| 30–49 | Needs Attention | Amber / Red |
| 0–29 | Critical | Red |

The bar uses dedicated health tokens (green / amber / red) that are independent of the app's neutral primary colour, and stay green above the 70 threshold in both light and dark mode.

---

## 6. Priority Weight and Urgency Ranking

### 6.1 Priority weight (P1–P10)

Default P5. Interpretation buckets shown in the UI:

| Range | Label |
|---|---|
| P1–P3 | Low |
| P4–P6 | Medium |
| P7–P8 | High |
| P9–P10 | Critical |

Mathematically the weight is continuous: it multiplies both the health penalty and the urgency score, with P5 as the 1.0× baseline.

### 6.2 Urgency score (Top 5 Urgent Tasks)

For each active task with a deadline, let `h` be hours until due:

| Condition | Time score |
|---|---|
| Overdue | `100 + min(|h|, 200)` |
| `h ≤ 48` | `80 − (h/48) × 60` (range 20–80) |
| `h ≤ 168` (7 days) | `20 − (h/168) × 15` (range 5–20) |
| Beyond 7 days | 0 |

`urgency = max(0, timeScore × importance_weight / 5)`

Tasks scoring zero are excluded; the remainder are sorted descending and the top five are displayed on the home dashboard, each labelled with its parent vertical's name and colour.

---

## 7. Application Surface — Screens and Functions

### 7.1 Home Dashboard

- Personalised greeting using the profile display name.
- Grid of vertical health cards: name, colour, health bar, score label, overdue and urgent counters. Cards are drag-and-drop reorderable, and the order persists.
- **Verticals Health** and **Top Urgent Tasks** sections each carry a help tip (`?`) explaining the mechanic — hover tooltip on desktop, tap popover on mobile.
- **Top 5 Urgent Tasks** list; clicking a task jumps to its vertical, scrolls to it, and highlights it.
- Hover micro-interactions: the activity icon pulses green, the trend arrow travels diagonally.
- **Empty state for new users:** a large call-to-action card explaining verticals with an inline light-green "Create Vertical" button. The Top Urgent Tasks section is hidden entirely until at least one vertical exists.

### 7.2 Vertical Page

- Health summary header with the health bar plus overdue/urgent counts, or an empty state.
- All blocks rendered as cards, drag-reorderable, each collapsible.
- Per-block: inline task creation with deadline picker, active task list sorted by deadline, collapsible Done section.
- Full-width dashed "Add Block" card at the end of the list, highlighting on hover.

### 7.3 Calendar

- Month, week, and day views.
- Every task with a deadline appears, colour-coded by its vertical.
- Clicking a calendar task navigates to the parent vertical and highlights the task.
- Times render according to the user's 24h / AM-PM preference.

### 7.4 Helix Wiki ("How It Works")

In-app documentation with anchor-link navigation, covering: structure, tasks, health score, priority weight, calendar, task notes, dashboard, and settings.

### 7.5 About

Product description and creator attribution, with the iridescent Helix wordmark.

### 7.6 Privacy Policy

Static legal page reachable from the settings menu, with contact details.

### 7.7 Settings (hamburger menu)

| Section | Functions |
|---|---|
| Appearance | Dark mode switch (label always reads "Dark mode" with a moon icon; the switch state indicates whether it is on). Persisted to local storage. |
| Verticals | List with colour picker popover, delete with cascade confirmation, click to navigate |
| Account | Edit display name; sign out |
| Preferences | Time format toggle (24h / AM-PM), persisted server-side to the profile and applied to every time display in the app; timezone shown read-only |
| Links | Helix Wiki, About, Privacy Policy |

### 7.8 Global navigation

- Horizontal tab bar of verticals, plus a home tab.
- Left hamburger menu for settings and secondary pages.
- The Helix logo is a home button: clicking it navigates home and fires a confetti spark burst from the logo's position.
- The wordmark uses the custom Bumbbled display font with an animated iridescent gradient.

---

## 8. Helix AI Agent

An inline conversational command bar positioned in the navigation row next to the Calendar toggle. It expands into a slide-up conversation panel and collapses back to a compact input.

**Capabilities:**

- Natural-language task creation. The agent collects, in order: which vertical, which block (existing or new), the task title, and an optional deadline. If the user supplies everything at once, it acts immediately.
- Tool calling against three functions: `create_vertical(name, color?)`, `create_block(vertical_id, name)`, and `create_task(block_id, title, due_date?)`.
- The user's current verticals and blocks are passed as context each turn so the agent references real records by ID rather than inventing them.
- Tool results are applied through the app's own data layer, so the dashboard, health scores, and calendar update immediately.
- Markdown-rendered replies, auto-scroll, Escape to close, backdrop click to dismiss, and a Clear history action.
- Graceful handling of rate limiting and credit exhaustion with user-facing messages.

**Model:** Gemini 3 Flash via the Lovable AI gateway, invoked from a server-side edge function so no key is ever exposed to the browser.

---

## 9. Authentication

| Flow | Behaviour |
|---|---|
| Email + password sign-up | Pre-checks whether the address already exists and blocks duplicates with a clear message; sends a confirmation email; shows a "check your email" screen with a **Resend confirmation** action on a 60-second cooldown |
| Email + password sign-in | Standard credential sign-in with inline error messaging |
| Google OAuth | One-click "Sign in with Google" / "Sign up with Google" (label adapts to the active tab), with a divider separating it from the email form. New Google users are provisioned automatically |
| Password reset | "Forgot password" sends a reset link; the dedicated reset page sets the new password and returns the user to the app |
| Session handling | The app subscribes to auth state changes and gates all content behind an authenticated session, with a loading splash during resolution |
| Sign out | From the settings menu |

The auth screen is deliberately locked to a light appearance regardless of the app theme, over a pastel gradient background, with the Helix wordmark placed above the card.

---

## 10. Design System

- **Typography:** Inter for the interface; Bumbbled (regular and light weights) for the Helix wordmark, rendered with an animated seven-stop iridescent gradient.
- **Colour:** fully tokenised HSL custom properties for background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, and ring — defined separately for light and dark themes. Light mode uses a neutral concrete-grey primary; dark mode uses a cyan-blue primary.
- **Health tokens:** dedicated green / amber / red variables kept independent of the primary colour so health always reads correctly.
- **Surfaces:** glass-style cards with a soft hover glow; corner radius 0.5rem; task rows use a divider-based editorial layout rather than boxed cards.
- **Interaction:** drag handles use a subtle horizontal three-dot grip; confetti on task completion and logo click; pulse highlight on navigated-to tasks.
- **Responsive:** mobile-first; tooltips degrade to tap popovers below the 768px breakpoint.

---

## 11. Technical Architecture

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Server state | TanStack React Query |
| Drag and drop | @hello-pangea/dnd |
| Backend | Lovable Cloud (PostgreSQL, Auth, Edge Functions) |
| AI | Lovable AI Gateway — Gemini 3 Flash |
| Effects | canvas-confetti, CSS transitions |

### 11.1 Edge functions

| Function | Purpose |
|---|---|
| `task-chat` | Hosts the AI agent: system prompt, tool schema, gateway call, and error mapping for rate limits and credit exhaustion |
| `check-email-exists` | Server-side duplicate-email check used before sign-up |

### 11.2 Data integrity

- `updated_at` triggers on tasks and task notes.
- Cascade deletes down the entire hierarchy, including on account deletion.
- Indexes on vertical owner, block parent, task parent, due date, and status.

### 11.3 Security

- Row-Level Security enabled on every table.
- Verticals are scoped directly by owner; blocks, tasks, and notes are scoped by walking the ownership chain back to the authenticated user, so no user can read or write another user's records at any level.
- Privileged operations (email existence check, AI calls) run server-side only.
- No client-side role or admin checks.

---

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Responsiveness | Mobile-first; fully usable on phone, tablet, desktop |
| Performance | Under 2 seconds to interactive on first load |
| Accessibility | Semantic HTML, keyboard navigation, visible focus states |
| Theming | Complete light and dark parity |
| Data privacy | Strict per-user isolation enforced at the database level |
| Resilience | Clear user-facing messaging for AI rate limits, credit exhaustion, and network failures |

---

## 13. Known Gaps

- Timezone is stored and displayed but not yet user-editable.
- Verticals can be recoloured and deleted from the settings menu but not renamed there.
- Archive flags exist on verticals and blocks in the schema but are not yet exposed as an archive UI.
- Task descriptions exist in the schema but are surfaced only through notes today.

---

## 14. Roadmap

- **Calendar integration** — Outlook and Google Calendar, either via OAuth and Graph API or via lighter-weight ICS import, turning meetings into tasks.
- **Recurring tasks** — daily, weekly, and monthly repeat patterns.
- **Notifications** — deadline reminders by email or push.
- **Health history** — trend charts showing score movement per vertical over time.
- **Custom email domain** — branded transactional email to improve deliverability.
- **Branded OAuth consent** — replace the default provider branding with Helix.
- **Collaboration** — shared verticals or blocks.
- **Mobile app** — PWA or React Native.

---

## 15. Success Metrics

| Metric | Definition |
|---|---|
| Activation | Percentage of new users who create a vertical and at least three tasks in week one |
| Engagement | Tasks created and completed per active session |
| Health maintenance | Average vertical health score trend across the user base |
| Neglect recovery | Percentage of verticals that recover from below 50 to above 70 within 14 days |
| Retention | Weekly return rate |
| AI adoption | Share of tasks created through the Helix AI agent |
