# UI Redesign — Design Spec
**Date:** 2026-05-21
**Status:** Approved

---

## Overview

Full UI overhaul of the Team Task Manager frontend. Replace the current light/indigo theme with a Linear-style dark SaaS aesthetic. Add a fixed left sidebar replacing the top navbar. Use Blue (#3B82F6) as the primary action color and Emerald (#10B981) for success/done states. Typography: Inter font. Target feel: professional, dark, tight — like Linear or Vercel.

---

## Design System & Color Tokens

```css
/* Background layers */
--bg-base:    #0A0A0A   /* sidebar, outermost shell */
--bg-surface: #111111   /* main content area */
--bg-card:    #1A1A1A   /* cards, panels, modals */
--bg-hover:   #222222   /* hover states */
--bg-input:   #111111   /* form inputs */

/* Borders */
--border:       #2A2A2A  /* default borders */
--border-focus: #3B82F6  /* focus rings */

/* Text */
--text-primary:   #F5F5F5  /* headings, main content */
--text-secondary: #A1A1AA  /* labels, metadata */
--text-muted:     #52525B  /* placeholders, disabled */

/* Blue — primary actions */
--blue-500: #3B82F6
--blue-600: #2563EB
--blue-dim: rgba(59,130,246,0.15)  /* blue tinted backgrounds */

/* Emerald — success/done */
--emerald-500: #10B981
--emerald-dim: rgba(16,185,129,0.15)

/* Status badges */
TODO:        text zinc-400,  bg zinc-800/50
IN_PROGRESS: text blue-400,  bg blue-500/15
DONE:        text emerald-400, bg emerald-500/15

/* Priority */
HIGH:   text red-400,   left-border red-500
MEDIUM: text amber-400, left-border amber-500
LOW:    text zinc-500,  no border accent

/* Typography */
Font: Inter (Google Fonts)
Heading lg: 20px / font-semibold
Heading sm: 16px / font-semibold
Body:        14px / font-normal
Small:       12px / font-normal
Mono labels: font-mono text-xs (badges, IDs)
```

---

## Layout Shell

### Sidebar (fixed, 240px, `#0A0A0A`)

```
┌──────────────────────────┐
│  🔷 TeamTask             │  ← Logo + app name, px-4 py-5
│──────────────────────────│
│  ⊞  Dashboard            │  ← Nav items with icons
│  ◫  Projects             │  ← Active = blue-500 text + blue-dim pill bg
│──────────────────────────│
│  MY PROJECTS             │  ← Section label: text-muted, text-xs uppercase
│    · Alpha Project       │  ← Project links, pl-6, text-secondary
│    · Beta Project        │  ← Clicking navigates to /projects/:id
│──────────────────────────│
│  [JD] John Doe           │  ← Bottom: initials avatar + name
│       john@example.com   │  ← email in text-muted
│                   [→]    │  ← Logout icon button
└──────────────────────────┘
```

- `fixed left-0 top-0 h-screen w-60 flex flex-col`
- Nav items: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm`
- Active state: `bg-blue-500/15 text-blue-400`
- Inactive: `text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]`
- Project list loads from the same `listProjects` API call
- User block: `mt-auto border-t border-[#2A2A2A] p-4`

### Content Area

- `ml-60 min-h-screen bg-[#111111]`
- Each page has a **PageHeader** component: `px-8 py-6 flex justify-between items-center border-b border-[#2A2A2A]`
- Auth pages (Login/Signup) render full-screen — no sidebar, no ml-60

### AppShell component

`AppShell.tsx` wraps `<Sidebar /> + <main className="ml-60 ...">children</main>`. Used inside `ProtectedRoute` so all authenticated pages get the sidebar automatically.

---

## New & Updated Components

| Component | Status | Description |
|---|---|---|
| `Sidebar.tsx` | New | Replaces Navbar. Fixed dark sidebar with nav, project list, user block |
| `AppShell.tsx` | New | Sidebar + content area wrapper |
| `PageHeader.tsx` | New | Reusable top bar: title + optional action button |
| `Badge.tsx` | Replaces StatusBadge | Handles status AND priority variants, dark-themed |
| `Avatar.tsx` | New | Initials circle, consistent color per name hash |
| `EmptyState.tsx` | New | Centered icon + heading + subtext for empty lists |
| `ConfirmModal.tsx` | New | Reusable confirmation dialog (replaces browser confirm()) |
| `Navbar.tsx` | Deleted | Replaced by Sidebar + AppShell |
| `StatusBadge.tsx` | Deleted | Replaced by Badge |
| `TaskCard.tsx` | Updated | Dark bg, left priority border, Avatar for assignee |
| `TaskForm.tsx` | Updated | Dark inputs, date min=today, clearer labels |
| `MemberList.tsx` | Updated | Dark styling, Avatar per member, loading state on Add |
| `ProtectedRoute.tsx` | Updated | Wraps children in AppShell |

---

## Page Designs

### Login / Signup

- Full screen: `min-h-screen bg-[#0A0A0A] flex items-center justify-center`
- Card: `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 w-full max-w-sm`
- App logo + "TeamTask" at top of card
- Inputs: `bg-[#111111] border border-[#2A2A2A] text-[#F5F5F5] rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none`
- Password field: has eye icon toggle (show/hide)
- Button: `w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium`
- Error: red-400 text with red-500/20 bg pill
- Link: `text-blue-400 hover:text-blue-300`

### Dashboard

- PageHeader: "My Tasks" + inline summary pills (Total `n` · In Progress `n` · Overdue `n`)
- Summary pills: small `bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1 text-xs` with colored numbers
- Table: `bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]`
  - Header row: `bg-[#111111] text-zinc-500 text-xs uppercase`
  - Body rows: `hover:bg-[#222222]` with `border-t border-[#2A2A2A]`
  - Overdue rows: `border-l-2 border-red-500` (left accent, not full red bg)
  - Columns: Title (link), Project (link), Status (Badge), Priority (Badge), Due Date
- Empty state: `EmptyState` component with checkmark icon

### Projects List

- PageHeader: "Projects" + "New Project" button
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Card: `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 hover:border-blue-500/50 transition-colors`
  - Project name: `text-[#F5F5F5] font-semibold`
  - Description: `text-zinc-500 text-sm mt-1`
  - Footer row: role badge (ADMIN=blue, MEMBER=zinc) + task count in muted text
- Create modal: `ConfirmModal`-style dark overlay + `bg-[#1A1A1A]` card with dark inputs

### Project Detail (Kanban)

- PageHeader: breadcrumb "Projects / {name}" + "New Task" button (ADMIN only)
- Layout: `flex gap-4 px-8 py-6`
- Three columns side by side, each:
  - Header: `flex items-center justify-between mb-3`
  - Column name: `text-sm font-semibold text-zinc-300`
  - Task count badge: `bg-[#222222] text-zinc-400 text-xs px-2 py-0.5 rounded-full`
  - Column body: `space-y-2 min-h-[200px]`
  - "Add task" button at bottom of TODO column (ADMIN): `text-zinc-500 hover:text-blue-400 text-sm w-full text-left py-2`
- TaskCard (updated):
  - `bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3`
  - Left border accent by priority: `border-l-2 border-red-500` (HIGH), `border-l-2 border-amber-500` (MEDIUM), no accent (LOW)
  - Title: `text-sm font-medium text-[#F5F5F5]`
  - Row below: `Badge` for status + priority text
  - Bottom row: `Avatar` with assignee initials + due date in `text-zinc-500 text-xs`
  - Overdue due date: `text-red-400`
- Members panel: collapsible right sidebar toggled by a "Members" icon button in PageHeader

### Task Detail

- Breadcrumb: `Projects / {project} / {task title}` in `text-zinc-500 text-sm`
- Two-column layout: `grid grid-cols-3 gap-8`
  - Left (col-span-2): title (editable h1), description (editable textarea or muted placeholder), activity section placeholder
  - Right (col-span-1): metadata sidebar card `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4`
    - Fields: Status, Priority, Assignee, Due Date — each as a labeled row
    - ADMIN: each field clickable/editable inline (dropdown or date picker appears)
    - MEMBER: status row has dropdown, all others show lock icon + read-only value
- Delete: `text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 text-sm` button → triggers `ConfirmModal`
- Back link: `← {project name}` in `text-zinc-500 hover:text-zinc-300`

---

## Removed / Not Changing

- Backend: no changes
- Routing: no changes
- API layer: no changes
- AuthContext: no changes
- All functionality preserved exactly — this is a pure visual overhaul

---

## Files to Delete

- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/StatusBadge.tsx`

## Files to Create

- `frontend/src/components/Sidebar.tsx`
- `frontend/src/components/AppShell.tsx`
- `frontend/src/components/PageHeader.tsx`
- `frontend/src/components/Badge.tsx`
- `frontend/src/components/Avatar.tsx`
- `frontend/src/components/EmptyState.tsx`
- `frontend/src/components/ConfirmModal.tsx`

## Files to Update

- `frontend/src/components/TaskCard.tsx`
- `frontend/src/components/TaskForm.tsx`
- `frontend/src/components/MemberList.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/Signup.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Projects.tsx`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/pages/TaskDetail.tsx`
- `frontend/index.html` (add Inter font import)
