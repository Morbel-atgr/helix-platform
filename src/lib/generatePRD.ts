import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

function heading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true })] });
}

function para(text: string, opts?: { bold?: boolean; italic?: boolean; spacing?: number }) {
  return new Paragraph({
    spacing: { after: opts?.spacing ?? 120 },
    children: [new TextRun({ text, bold: opts?.bold, italics: opts?.italic, size: 22 })],
  });
}

function bullet(text: string, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function boldBullet(label: string, desc: string, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: desc, size: 22 }),
    ],
  });
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function tableRow(cells: string[], header = false) {
  return new TableRow({
    children: cells.map(
      (c) =>
        new TableCell({
          borders,
          width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: c, bold: header, size: header ? 22 : 20 })] })],
        })
    ),
  });
}

export async function downloadPRD() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: 'Helix', size: 56, bold: true, color: '4A90D9' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: 'Product Requirements Document', size: 28, color: '666666' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: 'Version 1.0 · March 2026 · Created by Mor Bel', size: 20, color: '999999' })],
          }),

          // 1. Overview
          heading('1. Overview'),
          para(
            'Helix is a personal life management platform — a "Life Operating System" — that helps users organize their responsibilities across distinct life domains, track tasks with smart deadlines, and maintain awareness of what needs attention through a dynamic health scoring system.'
          ),

          // 2. The Problem
          heading('2. The Problem'),
          para(
            'Modern life demands that people manage multiple domains simultaneously — academics, career, health, finances, relationships, side projects — yet existing tools fail to address this holistically:',
            { spacing: 200 }
          ),
          boldBullet('Fragmented tools', 'People use separate apps for work tasks, personal to-dos, fitness goals, and academic deadlines. Nothing gives them a unified picture of how they\'re doing across all of life.'),
          boldBullet('No urgency awareness', 'Traditional to-do lists treat every task equally. A homework due tomorrow and a gym session next week sit side by side with no signal of what actually matters right now.'),
          boldBullet('Invisible neglect', 'When one life domain falls behind — say, fitness while focusing on exams — there\'s no early warning system. Users only realize they\'ve neglected an area when it\'s already a problem.'),
          boldBullet('Flat structure', 'Most task managers offer projects or tags, but nothing that maps to the natural way people think about their lives: "How is my degree going? How is my health?"'),
          boldBullet('Decision fatigue', 'Without automatic prioritization, users waste mental energy deciding what to work on next instead of just doing it.'),

          // 3. How Helix Solves It
          heading('3. How Helix Solves It'),
          para(
            'Helix introduces a structured, health-aware approach to personal task management that directly addresses each problem:'
          ),

          heading('3.1 Life Domains as "Verticals"', HeadingLevel.HEADING_2),
          para(
            'Instead of one flat task list, Helix organizes life into Verticals — top-level domains like "Degree", "Work", "Fitness", or "Side Project". Each vertical is colour-coded and independently tracked, giving users a mental model that mirrors how they actually think about their responsibilities.'
          ),

          heading('3.2 Dynamic Health Scoring', HeadingLevel.HEADING_2),
          para(
            'Every vertical has a real-time health score (0–100) that acts as an early warning system. The score decreases as deadlines approach and plummets when tasks go overdue. Users can glance at the Home dashboard and instantly see which life domains need attention — before things spiral.'
          ),
          bullet('7+ days to deadline → no penalty'),
          bullet('1–7 days → gradual decrease'),
          bullet('Under 48 hours → significant penalty, flagged as urgent'),
          bullet('Overdue → major, growing penalty'),

          heading('3.3 Automatic Priority Ranking', HeadingLevel.HEADING_2),
          para(
            'Helix combines deadline urgency with a user-assigned priority weight (P1–P10) to automatically rank tasks. The Home dashboard surfaces the top 5 most urgent tasks across ALL verticals, eliminating decision fatigue about what to do next.'
          ),

          heading('3.4 Hierarchical Organization', HeadingLevel.HEADING_2),
          para(
            'Within each vertical, tasks are grouped into Blocks (e.g., individual courses within a "Degree" vertical). This two-level hierarchy keeps things organized without overwhelming users with complexity.'
          ),

          heading('3.5 Cross-Domain Dashboard', HeadingLevel.HEADING_2),
          para(
            'The Home page provides a single view of all vertical health bars plus the most urgent tasks across every domain. This is the core differentiator — it answers "what should I do right now?" and "where am I falling behind?" in one glance.'
          ),

          // 4. Core Features
          heading('4. Core Features'),

          heading('4.1 Verticals', HeadingLevel.HEADING_2),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              tableRow(['Attribute', 'Description'], true),
              tableRow(['Name', 'User-defined label for the life domain']),
              tableRow(['Color', 'Unique colour for visual identification']),
              tableRow(['Health Score', 'Dynamic 0–100 score based on task deadlines']),
              tableRow(['Blocks', 'One or more task groups within the vertical']),
              tableRow(['Archived', 'Soft-delete flag']),
            ],
          }),

          heading('4.2 Blocks', HeadingLevel.HEADING_2),
          para('Groups of related tasks inside a vertical (e.g., individual courses, projects). Blocks are collapsible and support rename/delete.'),

          heading('4.3 Tasks', HeadingLevel.HEADING_2),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              tableRow(['Attribute', 'Description'], true),
              tableRow(['Title', 'Required. Editable inline.']),
              tableRow(['Deadline', 'Optional date + time. Defaults to 08:00.']),
              tableRow(['Priority Weight', 'P1–P10 (default P5). Higher = more impact.']),
              tableRow(['Status', 'active or done']),
              tableRow(['Notes', 'Multiple free-text notes per task']),
            ],
          }),
          para('', { spacing: 80 }),
          bullet('Auto-sorted by deadline proximity (most urgent first)'),
          bullet('Completed tasks collapse into a "Done" section per block'),
          bullet('Inline editing for title, deadline, and priority'),

          heading('4.4 Priority Weight (P1–P10)', HeadingLevel.HEADING_2),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              tableRow(['Range', 'Label', 'Impact'], true),
              tableRow(['P1–P3', 'Low', 'Minor']),
              tableRow(['P4–P6', 'Medium', 'Moderate']),
              tableRow(['P7–P8', 'High', 'Strong']),
              tableRow(['P9–P10', 'Critical', 'Maximum']),
            ],
          }),

          heading('4.5 Calendar View', HeadingLevel.HEADING_2),
          para('Monthly, weekly, and daily views showing all tasks with deadlines, colour-coded by vertical. Clicking a task navigates to it in context.'),

          heading('4.6 AI Chat Agent', HeadingLevel.HEADING_2),
          para('An inline AI assistant embedded in the navigation bar. Users can ask questions about their tasks, get suggestions, and interact conversationally.'),

          // 5. Pages & Navigation
          heading('5. Pages & Navigation'),
          boldBullet('Home Dashboard', 'Health bars for all verticals + top 5 most urgent tasks across all domains'),
          boldBullet('Vertical Page', 'All blocks and tasks for a selected vertical with full CRUD capabilities'),
          boldBullet('Calendar', 'Multi-view calendar with colour-coded tasks'),
          boldBullet('Helix Wiki', 'In-app documentation with anchor-link table of contents'),
          boldBullet('Settings', 'Theme toggle, time format, vertical management, account settings (via hamburger menu)'),

          // 6. Authentication & Security
          heading('6. Authentication & Security'),
          bullet('Email + password signup and login'),
          bullet('Email verification required before access'),
          bullet('Password reset flow via email link'),
          bullet('Row-Level Security (RLS) on all database tables'),
          bullet('Users can only access their own data'),

          // 7. Technical Architecture
          heading('7. Technical Architecture'),
          new Table({
            width: { size: 9000, type: WidthType.DXA },
            rows: [
              tableRow(['Layer', 'Technology'], true),
              tableRow(['Frontend', 'React + Vite + TypeScript']),
              tableRow(['Styling', 'Tailwind CSS + shadcn/ui']),
              tableRow(['State Management', 'TanStack React Query']),
              tableRow(['Backend', 'Lovable Cloud']),
              tableRow(['Database', 'PostgreSQL']),
              tableRow(['Auth', 'Lovable Cloud Auth']),
              tableRow(['Edge Functions', 'Deno runtime']),
            ],
          }),

          // 8. Future Considerations
          heading('8. Future Considerations'),
          bullet('Microsoft Outlook / Google Calendar integration — sync meetings as tasks'),
          bullet('Recurring tasks — daily/weekly/monthly repeat patterns'),
          bullet('Collaboration — shared verticals or blocks'),
          bullet('Mobile app — React Native or PWA'),
          bullet('Analytics dashboard — completion trends, health history over time'),
          bullet('Push notifications — deadline reminders via email or browser'),

          // 9. Success Metrics
          heading('9. Success Metrics'),
          bullet('Daily active usage (tasks created/completed per session)'),
          bullet('Health score maintenance (average score across verticals over time)'),
          bullet('User retention (weekly return rate)'),
          bullet('Task completion rate'),

          // Footer
          new Paragraph({ spacing: { before: 600 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '— End of Document —', color: '999999', size: 20, italics: true })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Helix-PRD.docx');
}
