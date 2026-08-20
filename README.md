# Helix — Life Operating System

Helix is a personal operating system for your life. Instead of one flat to-do list, it splits your life into **Verticals** (Work, Health, Finance, Family, …), each with its own tab, color and measurable **health score**, so you can see at a glance which part of your life is slipping.

## The problem

Life is fragmented across apps, inboxes and notebooks. Nothing tells you *which area* of your life is being neglected — only that you have 87 unfinished tasks.

## The solution

Helix makes each life area measurable and comparable, then surfaces the few things that actually matter right now.

## Features

- **Verticals** — dynamic tabs per life area, with custom colors, sidebar management and permanent deletion.
- **Blocks** — drag-and-drop groups of related tasks inside a vertical.
- **Tasks** — deadlines (12h/24h format preference), P1–P10 priorities via inline popover, completion confetti.
- **Task notes** — long-form free text in a right-side drawer, with badge counts on each task.
- **Health scores** — 0–100 per vertical, penalized by approaching and overdue deadlines; green when healthy.
- **Top urgent tasks** — the 5 most urgent items across all verticals, ranked by deadline pressure × priority weight.
- **Calendar** — month / week / day views, color-coded by vertical; click a task to jump straight to it.
- **AI agent** — a command bar that creates tasks, blocks and verticals from natural language.
- **Walkthrough** — a guided tour on login, with a "Never show this again" option.
- **Auth** — email/password with confirmation and reset, plus Google sign-in.
- **Wiki** — in-app documentation of every feature.
- **Theming** — light/dark mode, minimalist typography (Inter + the Bumbbled brand font).

## Tech stack

React + TypeScript + Vite, Tailwind CSS, shadcn/ui, TanStack Query, @hello-pangea/dnd, and a Supabase backend (Postgres with row-level security, auth, and edge functions for the AI agent).

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:8080`.

