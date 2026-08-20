# Helix — Life Operating System

## Overview

Helix is a personal operating system for your life. Instead of one flat to-do list, it splits your life into **Verticals** (Work, Health, Finance, Family, …), each with its own tab, color and measurable **health score**, so you can see at a glance which part of your life is slipping.

## How it works

1. **Create Verticals** for the areas that matter to you — Work, Health, Finance, Relationships, Hobbies, etc.
2. **Add Blocks** inside each vertical to group related tasks.
3. **Add Tasks** with deadlines and priorities.
4. **Track health** — each vertical gets a 0–100 score based on how well its tasks are doing. Deadlines approaching or overdue pull the score down; completing tasks on time keeps it up.
5. **Focus** — the dashboard highlights your top urgent tasks across all verticals, so you always know what to do next.

## The idea

Helix is built for people who feel their life is fragmented across apps, inboxes, notebooks and sticky notes. It solves the problem of *knowing you have a lot to do, but not knowing which area of your life is actually falling apart*. Helix makes every life area measurable and comparable, then surfaces the few things that really matter right now.

## Advantages and uniqueness

Unlike scattered tools like Excel, WhatsApp reminders, Apple Notes or the classic "let's just do this on a sheet of paper", Helix gives you:

- **A single, structured view** of your whole life — not just tasks, but *life areas*.
- **Measurable health** for every vertical, so you can spot neglect before it becomes a crisis.
- **Smart urgency ranking** that combines deadline pressure and priority to show what deserves attention now.
- **Built-in AI agent** that creates tasks, blocks and verticals from natural language.
- **A clean, minimalist design** with light/dark mode and no clutter.

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

React + TypeScript + Vite, Tailwind CSS, shadcn/ui, TanStack Query, @hello-pangea/dnd, and a Lovable Cloud backend (Postgres with row-level security, auth, and edge functions for the AI agent).

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:8080`.

## Resources

- **Live preview:** https://helix-platform.lovable.app
- **Helix Wiki:** available inside the app after signing in
