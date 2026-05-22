# Notion-Inspired UI Redesign — Design Spec
**Date:** 2026-05-22
**Status:** Pending Review
**Supersedes:** 2026-05-21-ui-redesign-design.md (already implemented)

---

## Overview

The previous dark redesign (all pages built, see commits through `6c86a31`) successfully established the dark theme shell. This spec upgrades the frontend to a **Notion-quality premium SaaS** aesthetic: richer typography, spatial breathing room, collapsible sidebar, sticky blur navbar, Framer Motion animations, proper mobile responsiveness, and a unified design token system.

**Goal:** When someone opens this app, they should think "this looks like Notion or Linear" — not "this looks like a dark admin dashboard."

**Scope:** Pure visual overhaul. No backend changes, no routing changes, no API changes. All functionality preserved exactly.

---

## Design Philosophy (Notion Reference)

Notion's dark mode key traits:
- **Barely-dark backgrounds**: `#191919` main, `#2F3437` secondary — not pure black
- **Warm neutral palette**: not cold zinc-grey; subtle warm-grey tones
- **8px spacing grid**: all padding/margin in multiples of 8px
- **Flat, minimal shadows**: only on elevated elements (modals, hover cards)
- **Typography-first**: large readable headings, clear hierarchy, generous line-height
- **Sidebar that breathes**: 224px, items have 8px padding, section headers in uppercase muted text
- **Smooth 150ms transitions**: hover, focus, active — never instant
- **Restraint with color**: accents used sparingly; the UI is mostly neutral

---

## Design Token System

Replace all scattered inline hex values with a consistent token set. Define in `src/styles/tokens.ts` and `index.css` CSS variables:

```css
/* Backgrounds */
--bg-app:      #191919   /* outer app shell */
--bg-surface:  #2F3437   /* primary content, cards */
--bg-elevated: #373C3F   /* sidebar, raised panels */
--bg-hover:    #3F4448   /* hover state on items */
--bg-input:    #2F3437   /* form inputs */
--bg-overlay:  rgba(0,0,0,0.7)  /* modal backdrop */

/* Borders */
--border-subtle:  rgba(255,255,255,0.08)   /* very subtle dividers */
--border-default: rgba(255,255,255,0.12)   /* default card borders */
--border-strong:  rgba(255,255,255,0.20)   /* hover/focus borders */
--border-focus:   #447ACB                   /* focus ring color */

/* Text */
--text-primary:   #D4D4D4   /* main readable text */
--text-secondary: #9B9B9B   /* metadata, labels */
--text-muted:     #6B6B6B   /* placeholders, disabled */
--text-bright:    #FFFFFF   /* headings, emphasized */

/* Accent — Indigo/Blue (kept from previous spec for brand consistency) */
--accent:      #4F6FF5   /* primary actions */
--accent-dim:  rgba(79,111,245,0.15)   /* accent backgrounds */
--accent-hover:#3D5BF0   /* hover on accent */

/* Status */
--status-todo-text:     #9B9B9B
--status-todo-bg:       rgba(155,155,155,0.12)
--status-progress-text: #447ACB
--status-progress-bg:   rgba(68,122,203,0.15)
--status-done-text:     #2D9964
--status-done-bg:       rgba(45,153,100,0.15)

/* Priority */
--priority-high-text:   #CD4945
--priority-high-border: #CD4945
--priority-med-text:    #CA8E1B
--priority-med-border:  #CA8E1B
--priority-low-text:    #6B6B6B
```

Tailwind equivalents used inline (these map to the values above):
- `bg-[#191919]` → app background
- `bg-[#2F3437]` → card/surface
- `bg-[#373C3F]` → sidebar/elevated
- `bg-[#3F4448]` → hover
- `text-[#D4D4D4]` → primary text
- `text-[#9B9B9B]` → secondary text

---

## Dependencies to Add

```bash
npm install framer-motion lucide-react
```

- **Framer Motion** — page transitions, modal animations, sidebar slide, card hover
- **Lucide React** — consistent icon system (replaces inline SVGs everywhere)

---

## Layout Shell Changes

### AppShell — Mobile-Responsive Collapsible Sidebar

**Current:** Fixed 240px sidebar, no mobile support, `ml-60` hard-coded on main.

**New design:**

```
Desktop (lg+):                     Mobile (<lg):
┌──────────┬─────────────────┐    ┌─────────────────────────┐
│ Sidebar  │  Content        │    │ [☰] TopBar              │
│ 224px    │  (flex-1)       │    │─────────────────────────│
│ fixed    │                 │    │  Content                │
│          │                 │    │  (full width)           │
└──────────┴─────────────────┘    └─────────────────────────┘
                                  + Sidebar slides in as overlay
```

**AppShell.tsx:**
- `lg:ml-56` on main (sidebar is 224px = `w-56`)
- Mobile: sidebar hidden by default, toggled by hamburger in top bar
- Framer Motion `AnimatePresence` + `motion.aside` for sidebar slide-in/out on mobile
- Backdrop overlay on mobile when sidebar open

### Sidebar

**Width:** `w-56` (224px) — slightly narrower than current 240px, matching Notion

**Background:** `bg-[#373C3F]` — Notion's warm dark, not pure black

**Structure:**
```
┌─ Sidebar ─────────────────────┐
│  [TT] TeamTask         [← ×]  │  ← Logo + collapse toggle (desktop only)
│                               │
│  Search...                    │  ← Search shortcut bar
│                               │
│  ⊞  Dashboard                 │  ← Main nav
│  ◫  Projects                  │
│                               │
│  MY PROJECTS          (8px)   │  ← Section header: uppercase, 11px, muted
│    ◉  Alpha Project           │  ← Colored dot + name, truncated
│    ◉  Beta Project            │
│    + New project              │  ← Add shortcut at bottom of list
│                               │
│  ──────────────────────────   │  ← divider
│  [JD]  john@example.com  [→]  │  ← User block at bottom
└───────────────────────────────┘
```

**Nav item specs:**
- Height: 30px, padding: `px-2 py-1.5`, gap: `gap-2`
- Font: 14px, weight 500
- Icon: 16px Lucide icon, `shrink-0`
- Inactive: `text-[#D4D4D4] hover:bg-[#3F4448]`, transition `duration-150`
- Active: `bg-[#454B4E] text-white font-medium`
- Border radius: `rounded-md` (6px)

**Section headers:**
- `text-[10px] uppercase tracking-widest text-[#6B6B6B] font-semibold px-2 mb-1`

**Project list items:**
- Dot: 6px circle, colored per avatar color
- Name: truncated, 13px, `text-[#9B9B9B]` inactive, `text-[#D4D4D4]` active
- Active: `bg-[#454B4E]`

**Collapse behavior (desktop):**
- Toggle button: top-right of sidebar (only visible on hover of sidebar)
- Collapsed state: `w-12` (icons only, no labels)
- Framer Motion `animate={{ width: collapsed ? 48 : 224 }}` with `duration: 0.2`
- Collapsed state hides all text labels, section headers; shows only icons

### TopBar (replaces PageHeader)

**Updated component: `PageHeader.tsx`** — evolves into a sticky blur top bar.

```
┌─ PageHeader ──────────────────────────────────────────────────┐
│  [☰ mobile] Breadcrumb / Page Title   [action]  [🔔] [JD]   │
└───────────────────────────────────────────────────────────────┘
```

- `sticky top-0 z-30 bg-[#191919]/80 backdrop-blur-md border-b border-white/[0.08]`
- Height: 48px (`h-12`), `px-6 flex items-center gap-4`
- Mobile: hamburger `Menu` Lucide icon on left opens sidebar overlay
- Left: breadcrumb text (existing prop) + `/ title` 
- Middle-right: action slot (existing prop — "New Task", "New Project" buttons)
- Far right: notification bell icon (decorative) + user avatar (opens a simple popover with "Sign out")
- No separate `TopBar.tsx` file needed — `PageHeader.tsx` handles this

---

## Component-by-Component Specs

### Badge.tsx — Enhanced

Same logic, slightly refined styling:
- Border radius: `rounded` (4px) instead of `rounded-md`
- Add a small colored dot before the label for status badges
- Status dot: `w-1.5 h-1.5 rounded-full mr-1.5` with matching color
- Remove `font-mono` — use regular sans-serif

```
● Todo        (grey dot)
● In Progress (blue dot)
● Done        (green dot)
```

### Avatar.tsx — Add `lg` size

Add a third size option:
- `sm`: 24×24, text-xs (existing)
- `md`: 32×32, text-sm (existing)
- `lg`: 40×40, text-base (new — for user profile in sidebar)

### TaskCard.tsx — Notion-style card

**Current:** Very tight, feels like a JIRA list item.

**New:**
- Background: `bg-[#2F3437]` (warmer surface)
- Border: `border border-white/10 hover:border-white/20`
- Padding: `p-3` (12px all sides)
- `rounded-lg` (8px)
- Priority accent: left border 3px (not 2px), only HIGH and MEDIUM
- Title: 13px, weight 500, `text-[#D4D4D4]` → `text-white` on hover
- Assignee + due date row: `mt-2 flex items-center justify-between`
- Framer Motion: `whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}`
- Overdue indicator: small red pill `Overdue` instead of `!!`
- Remove badges from card (too noisy) — replace with small colored priority dot + due date only

### TaskForm.tsx — Cleaner modal form

- Modal wrapper: `max-w-lg` (wider than current `max-w-md`)
- Section-style form with dividers between field groups
- Textarea rows: 3 (current is 2 — too small)
- Grid for Priority + Due Date remains 2-col
- Button group: primary full-width, cancel as ghost text below

### MemberList.tsx — Refined member rows

- Member row height: 40px (slightly taller for breathing room)
- Avatar size: `md` (32px) — current uses `sm` which is too small
- Name: 13px, `text-[#D4D4D4]`; email: 11px, `text-[#6B6B6B]`
- Role badge: smaller, inline with name row right side
- Remove button: use Lucide `X` icon, 14px

### EmptyState.tsx — Notion-style empty state

- Replace emoji icon with Lucide icon component
- Icon: 48px, `text-[#454B4E]`
- Heading: 15px, `text-[#9B9B9B]`, weight 500
- Subtext: 13px, `text-[#6B6B6B]`
- Optional CTA button: ghost style, accent color

---

## Page Designs

### Login / Signup

**Current state is acceptable** — clean centered card. Small refinements only:
- Background: `bg-[#191919]` (warmer than current `#0A0A0A`)
- Card background: `bg-[#2F3437]` (warmer than `#1A1A1A`)
- Card border: `border-white/10`
- Input background: `bg-[#373C3F]`
- Logo: use Lucide `CheckSquare` icon instead of text "TT"
- Add Framer Motion `initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}` on card

### Dashboard

**Current:** Plain table with pills in header.

**New layout:**
```
┌─ Page Content ─────────────────────────────────────────────────┐
│  My Tasks                                                       │
│  [3 Total]  [1 In Progress]  [2 Overdue]   (stat pills)        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Task           Project    Status      Priority  Due      │  │
│  │──────────────────────────────────────────────────────────│  │
│  │  ● Fix login    Alpha      ● In Progress  ↑ High  Jan 5  │  │
│  │  ● Add modal    Beta       ● Todo         → Med   —      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Stat pills:** Keep as is but use new token colors.

**Table:**
- `bg-[#2F3437]` instead of `bg-[#1A1A1A]`
- Row hover: `hover:bg-[#373C3F]`
- Overdue row: `border-l-2 border-[#CD4945]` (kept from previous spec)
- Column widths: Task (40%), Project (20%), Status (15%), Priority (12%), Due (13%)
- Add `cursor-pointer` on rows with `onClick` navigate — entire row is clickable
- Framer Motion: `AnimatePresence` + `motion.tr` with `initial={{ opacity: 0 }}` for row entry

**Loading skeleton:**
- Replace `animate-pulse` divs with proper skeleton rows that match table structure
- Each skeleton row: 5 cells, alternating widths, `bg-[#373C3F]` with pulse

### Projects

**Current:** Grid of minimal cards (name + role badge only).

**New card design:**
```
┌─ Project Card ──────────────────────────────┐
│  Alpha Project                  [ADMIN]     │
│  Building the core auth system...           │
│                                             │
│  [JD] [AB] [MK]  +2 members                │
│                                             │
│  ▓▓▓▓▓▓▓▓░░░░░░░░  60%  ·  12 tasks        │
└─────────────────────────────────────────────┘
```

- Card: `bg-[#2F3437] border border-white/10 rounded-xl p-5`
- Hover: `hover:border-white/20 hover:shadow-lg` + Framer `whileHover={{ y: -2 }}`
- Name: 15px, weight 600, `text-white`
- Description: 13px, `text-[#9B9B9B]`, `line-clamp-2`
- Member avatars: stacked with `-ml-2` (first 3 shown, rest "+N")
- Progress bar: `h-1.5 rounded-full bg-[#454B4E]`, fill `bg-indigo-500`
  - Note: progress = `DONE tasks / total tasks * 100` — requires data from API
  - If API doesn't return this, show bar as decorative or skip (see note below)
- Task count: `text-xs text-[#6B6B6B]`
- Role badge: top-right corner, stays

**API note:** Current `listProjects` returns `{ id, name, description, role }` only. Progress bar and task count require either: (a) a separate API call per project (expensive), or (b) a backend enhancement. **For now: omit progress bar and task count from the card.** Only show member avatars if members data is available (it's not in list endpoint either). **Simplified card**: name, description, role badge, hover animation. This is pragmatic — no fake data.

### ProjectDetail (Kanban)

**Current:** Static 3-column grid.

**New design:**
```
┌─ Page Content ─────────────────────────────────────────────────┐
│  PageHeader: Alpha Project  [Members (3)]  [+ New Task]        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Todo    (3) │  │ In Progress  │  │   Done   (5) │         │
│  │              │  │     (2)      │  │              │         │
│  │  ┌─────────┐ │  │  ┌────────┐ │  │  ┌────────┐  │         │
│  │  │ Task 1  │ │  │  │Task 4  │ │  │  │Task 6  │  │         │
│  │  └─────────┘ │  │  └────────┘ │  │  └────────┘  │         │
│  │  + Add task  │  │             │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

**Column specs:**
- Background: `bg-[#2F3437]/50` (semi-transparent, subtle column)
- Border: `border border-white/8 rounded-xl`
- Padding: `p-3`
- Header: column name `text-[#D4D4D4] text-sm font-semibold` + count badge
- Count badge: `bg-[#454B4E] text-[#9B9B9B] text-xs px-2 py-0.5 rounded-full`
- Min-height: `min-h-[400px]`
- Scrollable: `overflow-y-auto max-h-[calc(100vh-200px)]`

**Responsive Kanban:**
- Desktop (lg+): 3 columns horizontal
- Tablet (md): horizontal scroll (`overflow-x-auto flex gap-4`, each column `min-w-[280px]`)
- Mobile: stacked vertically as accordion sections (each column collapsible)

**Add task button:** Remains at bottom of TODO column, admin only. New style: `text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448]` with `+` Lucide icon.

**Framer Motion on cards:** `layout` prop for reordering, `AnimatePresence` for add/remove.

### TaskDetail

**Current:** 2/3 left + 1/3 right grid.

**New design — kept similar, refined:**
- Background: `bg-[#191919]`
- Left panel: no card background — just `px-8 py-6` on `#191919`
- Title: Larger — `text-2xl font-semibold text-white` (current is `text-xl`)
- Description area: `bg-[#2F3437] rounded-xl p-4 min-h-[120px]`
- Section labels: `text-[11px] uppercase tracking-widest text-[#6B6B6B] mb-2`
- Right metadata card: `bg-[#2F3437] border border-white/10 rounded-xl p-5`
- Each metadata row: label + value, `border-b border-white/8 py-3 last:border-0`
- Selects/inputs: `bg-[#373C3F] border-none rounded-lg`
- Creator info: moved to bottom of left panel, smaller
- Back link: now uses Lucide `ArrowLeft`, `text-[#6B6B6B] hover:text-[#D4D4D4]`

---

## Animation Specs (Framer Motion)

### Page Entry
```typescript
// Wrap each page's root div
<motion.div
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

### Modal Entry/Exit
```typescript
// Backdrop
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
/>

// Modal card
<motion.div
  initial={{ opacity: 0, scale: 0.97, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.97, y: 8 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
/>
```

### Sidebar (mobile)
```typescript
<motion.aside
  initial={{ x: -224 }}
  animate={{ x: 0 }}
  exit={{ x: -224 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
/>
```

### Sidebar collapse (desktop)
```typescript
<motion.aside
  animate={{ width: collapsed ? 48 : 224 }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
/>
```

### Task card hover
```typescript
<motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
```

### Project card hover
```typescript
<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
```

### Table rows enter
```typescript
<motion.tr
  initial={{ opacity: 0, x: -4 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.03 }}
/>
```

---

## Icon System (Lucide React)

Replace all inline SVG paths with Lucide icons. Mapping:

| Usage | Lucide Icon | Size |
|-------|-------------|------|
| Dashboard nav | `LayoutDashboard` | 16px |
| Projects nav | `FolderOpen` | 16px |
| New/Add | `Plus` | 16px |
| Delete/Remove | `Trash2` | 16px |
| Close modal | `X` | 16px |
| Back arrow | `ArrowLeft` | 16px |
| Logout | `LogOut` | 16px |
| Members | `Users` | 16px |
| Hamburger | `Menu` | 20px |
| Search | `Search` | 16px |
| Notification | `Bell` | 16px |
| Settings | `Settings` | 16px |
| Chevron expand | `ChevronRight` | 14px |
| Lock (non-admin) | `Lock` | 12px |
| Eye toggle | `Eye` / `EyeOff` | 16px |
| Project dot | `Circle` filled | 8px |

---

## Responsiveness Checklist

| Breakpoint | Sidebar | Kanban | Table | Cards Grid |
|------------|---------|--------|-------|------------|
| Mobile (<768px) | Hidden, overlay toggle | Stacked accordion | Scroll horizontally | 1 col |
| Tablet (768-1024px) | Visible, can collapse | Horizontal scroll | Full table | 2 col |
| Desktop (>1024px) | Visible, collapsible | 3 col side-by-side | Full table | 3 col |

**Mobile table:** On mobile (`<768px`), the Dashboard table becomes a card list — each task as:
```
┌─ Task Card (mobile) ──────────────────┐
│  Fix login bug                        │  ← task title, 14px
│  Alpha Project  ·  ● In Progress      │  ← project + status badge
│  ↑ High  ·  Jan 5 (Overdue)          │  ← priority + due date
└───────────────────────────────────────┘
```
Card: `bg-[#2F3437] rounded-xl p-4 border border-white/10`

---

## Files to Create

*(No new files needed — TopBar is absorbed into updated PageHeader)*

## Files to Update (all existing files)

- `frontend/src/index.css` — update CSS variables, scrollbar styling
- `frontend/src/components/AppShell.tsx` — mobile sidebar toggle, TopBar integration
- `frontend/src/components/Sidebar.tsx` — Notion colors, Lucide icons, collapsible, mobile
- `frontend/src/components/PageHeader.tsx` — integrate with TopBar or simplify
- `frontend/src/components/TaskCard.tsx` — Notion card style, Framer Motion hover
- `frontend/src/components/TaskForm.tsx` — wider modal, improved spacing
- `frontend/src/components/MemberList.tsx` — larger avatars, refined rows
- `frontend/src/components/Badge.tsx` — dot indicator, no font-mono
- `frontend/src/components/Avatar.tsx` — add `lg` size
- `frontend/src/components/EmptyState.tsx` — Lucide icon, refined typography
- `frontend/src/pages/Login.tsx` — warmer colors, Framer Motion card entry
- `frontend/src/pages/Signup.tsx` — same as Login
- `frontend/src/pages/Dashboard.tsx` — animated rows, mobile card view
- `frontend/src/pages/Projects.tsx` — animated cards, hover lift
- `frontend/src/pages/ProjectDetail.tsx` — column styles, responsive kanban
- `frontend/src/pages/TaskDetail.tsx` — larger title, refined metadata sidebar

## Files NOT Changing

- All files in `frontend/src/api/`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/components/ConfirmModal.tsx`
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/App.tsx`
- All backend files

---

## What This Is NOT

- Not a drag-and-drop Kanban (no dnd-kit or react-beautiful-dnd — scope too large)
- Not adding new pages (Settings, Profile, etc.)
- Not adding notification functionality
- Not adding search functionality (search icon is decorative/placeholder)
- Not changing any data models or API contracts
