# Notion-Inspired UI Redesign Implementation Plan

**Goal:** Upgrade the existing dark TeamTaskManager UI from a generic admin-dashboard look to a Notion/Linear-quality premium SaaS aesthetic with warm neutral colors, Framer Motion animations, collapsible sidebar, sticky blur navbar, Lucide icons, and full mobile responsiveness.

**Architecture:** Pure visual overhaul — no API, routing, or backend changes. All 16 frontend files are updated in place. Two new npm dependencies (framer-motion, lucide-react) are added. Changes flow from foundational (deps, tokens, shared components) to pages.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, React Router v7

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/package.json` | Modify | Add framer-motion + lucide-react |
| `frontend/src/index.css` | Modify | Warm color scrollbar, CSS variables |
| `frontend/src/components/Avatar.tsx` | Modify | Add `lg` size (40px) |
| `frontend/src/components/Badge.tsx` | Modify | Dot indicator, warmer colors, no font-mono |
| `frontend/src/components/EmptyState.tsx` | Modify | Lucide icon prop, refined typography |
| `frontend/src/components/AppShell.tsx` | Modify | Mobile sidebar state, backdrop, responsive main |
| `frontend/src/components/Sidebar.tsx` | Modify | Notion colors, Lucide icons, collapsible + mobile |
| `frontend/src/components/PageHeader.tsx` | Modify | Sticky blur bar, hamburger, bell, avatar dropdown |
| `frontend/src/components/TaskCard.tsx` | Modify | Notion card style, Framer hover lift |
| `frontend/src/components/TaskForm.tsx` | Modify | Warmer inputs, wider modal, better spacing |
| `frontend/src/components/MemberList.tsx` | Modify | Larger avatars, Lucide X, refined rows |
| `frontend/src/pages/Login.tsx` | Modify | Warmer colors, Framer card entry, Lucide icons |
| `frontend/src/pages/Signup.tsx` | Modify | Same as Login |
| `frontend/src/pages/Dashboard.tsx` | Modify | Animated rows, mobile card list, skeleton |
| `frontend/src/pages/Projects.tsx` | Modify | Animated cards, hover lift, warmer colors |
| `frontend/src/pages/ProjectDetail.tsx` | Modify | Column styles, responsive kanban, Framer |
| `frontend/src/pages/TaskDetail.tsx` | Modify | Larger title, refined metadata sidebar |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install framer-motion and lucide-react**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm install framer-motion lucide-react
```

Expected output: added 2 packages (or similar), no errors.

- [ ] **Step 2: Verify packages installed**

```bash
cat package.json | grep -E "framer-motion|lucide-react"
```

Expected: both packages appear under `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add framer-motion and lucide-react"
```

---

## Task 2: Update Global Styles (index.css)

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Replace index.css with warm Notion-style globals**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: #191919;
    color: #D4D4D4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.12);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.20);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: warm Notion-style global colors and scrollbar"
```

---

## Task 3: Update Avatar Component

**Files:**
- Modify: `frontend/src/components/Avatar.tsx`

- [ ] **Step 1: Add `lg` size and update colors to warm palette**

```tsx
const COLORS = [
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-violet-500/20 text-violet-300',
  'bg-amber-500/20 text-amber-300',
  'bg-pink-500/20 text-pink-300',
  'bg-cyan-500/20 text-cyan-300',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, size = 'sm' }: AvatarProps) {
  const sizeClass =
    size === 'sm' ? 'w-6 h-6 text-[10px]' :
    size === 'md' ? 'w-8 h-8 text-xs' :
    'w-10 h-10 text-sm';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium shrink-0 ${sizeClass} ${getColor(name)}`}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Avatar.tsx
git commit -m "feat: add lg size to Avatar, warm palette"
```

---

## Task 4: Update Badge Component

**Files:**
- Modify: `frontend/src/components/Badge.tsx`

- [ ] **Step 1: Add colored dot indicator, remove font-mono, warm colors**

```tsx
type StatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';

const statusConfig: Record<StatusType, { dot: string; text: string; bg: string; label: string }> = {
  TODO:        { dot: 'bg-[#9B9B9B]', text: 'text-[#9B9B9B]', bg: 'bg-[#9B9B9B]/12', label: 'Todo' },
  IN_PROGRESS: { dot: 'bg-[#447ACB]', text: 'text-[#447ACB]', bg: 'bg-[#447ACB]/15', label: 'In Progress' },
  DONE:        { dot: 'bg-[#2D9964]', text: 'text-[#2D9964]', bg: 'bg-[#2D9964]/15', label: 'Done' },
};

const priorityConfig: Record<PriorityType, { text: string; bg: string; label: string }> = {
  HIGH:   { text: 'text-[#CD4945]', bg: 'bg-[#CD4945]/12', label: 'High' },
  MEDIUM: { text: 'text-[#CA8E1B]', bg: 'bg-[#CA8E1B]/12', label: 'Medium' },
  LOW:    { text: 'text-[#6B6B6B]', bg: 'bg-[#6B6B6B]/12', label: 'Low' },
};

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export default function Badge({ type, value }: BadgeProps) {
  if (type === 'status') {
    const cfg = statusConfig[value as StatusType] ?? statusConfig.TODO;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  const cfg = priorityConfig[value as PriorityType] ?? priorityConfig.LOW;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Badge.tsx
git commit -m "feat: Badge with colored dot, warm Notion colors"
```

---

## Task 5: Update EmptyState Component

**Files:**
- Modify: `frontend/src/components/EmptyState.tsx`

- [ ] **Step 1: Accept a Lucide icon component, refine typography**

```tsx
import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  heading: string;
  subtext?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = InboxIcon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#2F3437] flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[#454B4E]" />
      </div>
      <p className="text-[15px] font-medium text-[#9B9B9B]">{heading}</p>
      {subtext && <p className="text-[13px] text-[#6B6B6B] mt-1">{subtext}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/EmptyState.tsx
git commit -m "feat: EmptyState with Lucide icon, refined typography"
```

---

## Task 6: Update AppShell — Mobile Sidebar Support

**Files:**
- Modify: `frontend/src/components/AppShell.tsx`

- [ ] **Step 1: Add mobile sidebar open state, backdrop, responsive main margin**

```tsx
import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#191919]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-h-screen lg:ml-56 min-w-0">
        {/* Pass the open setter down via context trick: clone children with prop */}
        {typeof children === 'object' && children !== null
          ? // inject onMenuClick into PageHeader via a wrapper div approach
            // We use a simple context for this
            <SidebarToggleContext.Provider value={() => setSidebarOpen(true)}>
              {children}
            </SidebarToggleContext.Provider>
          : children}
      </main>
    </div>
  );
}

// Context for PageHeader to access the sidebar toggle
import { createContext, useContext } from 'react';
export const SidebarToggleContext = createContext<() => void>(() => {});
export const useSidebarToggle = () => useContext(SidebarToggleContext);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AppShell.tsx
git commit -m "feat: AppShell mobile sidebar support with backdrop"
```

---

## Task 7: Update Sidebar — Notion Style, Collapsible, Lucide Icons

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Full Sidebar rewrite with Notion colors, Lucide icons, collapse, mobile**

```tsx
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, Plus, LogOut,
  ChevronLeft, ChevronRight, X, Circle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../api/projects';
import Avatar from './Avatar';

interface Project {
  id: string;
  name: string;
  role: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.data.projects))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const width = collapsed ? 48 : 224;

  const navItemBase = 'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors duration-150';
  const navItemActive = 'bg-[#454B4E] text-white';
  const navItemInactive = 'text-[#D4D4D4] hover:bg-[#3F4448]';

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `${navItemBase} ${isActive ? navItemActive : navItemInactive}`;

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold">TT</span>
                </div>
                <span className="text-white font-semibold text-sm">TeamTask</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden w-6 h-6 flex items-center justify-center rounded text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 space-y-0.5 shrink-0">
        <NavLink to="/dashboard" className={navItemClass} title="Dashboard">
          <LayoutDashboard size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        <NavLink to="/projects" className={navItemClass} title="Projects">
          <FolderOpen size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Projects
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </nav>

      {/* Project list */}
      {!collapsed && projects.length > 0 && (
        <div className="px-2 mt-4 shrink-0">
          <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-widest px-2 mb-1">
            My Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 8).map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#454B4E] text-[#D4D4D4]'
                      : 'text-[#9B9B9B] hover:bg-[#3F4448] hover:text-[#D4D4D4]'
                  }`
                }
              >
                <Circle size={6} className="shrink-0 fill-current" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* User block */}
      <div className="mt-auto border-t border-white/[0.08] p-2 shrink-0">
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar name={user?.email ?? 'U'} size={collapsed ? 'sm' : 'md'} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-[12px] text-[#D4D4D4] truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                title="Sign out"
                className="text-[#6B6B6B] hover:text-[#CD4945] transition-colors shrink-0"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#373C3F] border-r border-white/[0.08] z-40 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -224 }}
            animate={{ x: 0 }}
            exit={{ x: -224 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ width: 224 }}
            className="flex lg:hidden flex-col fixed left-0 top-0 h-screen bg-[#373C3F] border-r border-white/[0.08] z-50 overflow-hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: Sidebar with Notion colors, Lucide icons, collapsible + mobile"
```

---

## Task 8: Update PageHeader — Sticky Blur Bar

**Files:**
- Modify: `frontend/src/components/PageHeader.tsx`

- [ ] **Step 1: Rewrite as sticky blur top bar with hamburger and bell**

```tsx
import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebarToggle } from './AppShell';
import Avatar from './Avatar';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, action }: PageHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const openSidebar = useSidebarToggle();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 h-12 bg-[#191919]/80 backdrop-blur-md border-b border-white/[0.08] flex items-center px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={openSidebar}
        className="lg:hidden text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb + Title */}
      <div className="flex-1 min-w-0">
        {breadcrumb ? (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#6B6B6B] truncate">{breadcrumb}</span>
            <span className="text-[#454B4E]">/</span>
            <span className="text-[#D4D4D4] font-medium truncate">{title}</span>
          </div>
        ) : (
          <span className="text-[#D4D4D4] font-medium text-sm">{title}</span>
        )}
      </div>

      {/* Action slot */}
      {action && <div className="shrink-0">{action}</div>}

      {/* Right icons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#2F3437] transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2F3437] transition-colors"
          >
            <Avatar name={user?.email ?? 'U'} size="sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 w-52 bg-[#2F3437] border border-white/[0.12] rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="text-[12px] text-[#9B9B9B] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#D4D4D4] hover:bg-[#3F4448] transition-colors"
              >
                <LogOut size={14} className="text-[#6B6B6B]" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/PageHeader.tsx
git commit -m "feat: PageHeader as sticky blur navbar with hamburger + user dropdown"
```

---

## Task 9: Update TaskCard Component

**Files:**
- Modify: `frontend/src/components/TaskCard.tsx`

- [ ] **Step 1: Notion-style card with Framer Motion hover lift**

```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

const priorityBorderColor: Record<string, string> = {
  HIGH: '#CD4945',
  MEDIUM: '#CA8E1B',
};

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const borderColor = priorityBorderColor[task.priority];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Link
        to={`/projects/${projectId}/tasks/${task.id}`}
        className="block bg-[#2F3437] border border-white/10 hover:border-white/20 rounded-lg p-3 transition-colors"
        style={borderColor ? { borderLeft: `3px solid ${borderColor}` } : undefined}
      >
        <p className="text-[13px] font-medium text-[#D4D4D4] leading-snug mb-2 group-hover:text-white">
          {task.title}
        </p>

        <div className="flex items-center justify-between">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <Avatar name={task.assignee.name} size="sm" />
              <span className="text-[11px] text-[#6B6B6B] truncate max-w-[80px]">
                {task.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#454B4E]">Unassigned</span>
          )}

          <div className="flex items-center gap-1.5">
            {isOverdue && (
              <span className="text-[10px] font-medium text-[#CD4945] bg-[#CD4945]/12 px-1.5 py-0.5 rounded">
                Overdue
              </span>
            )}
            {task.dueDate && !isOverdue && (
              <span className="text-[11px] text-[#6B6B6B]">
                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/TaskCard.tsx
git commit -m "feat: TaskCard Notion style with Framer hover lift"
```

---

## Task 10: Update TaskForm Component

**Files:**
- Modify: `frontend/src/components/TaskForm.tsx`

- [ ] **Step 1: Warmer input styles, wider layout, better button hierarchy**

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';

interface Member {
  userId: string;
  user: { id: string; name: string };
}

interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
}

interface Props {
  members: Member[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';
const labelClass = 'block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5';

const today = new Date().toISOString().split('T')[0];

export default function TaskForm({ members, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ title, description, priority, dueDate, assigneeId });
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save task');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2">
          <p className="text-[#CD4945] text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="What needs to be done?"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Add more context..."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Due date <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Assignee <span className="normal-case text-[#454B4E] font-normal">optional</span></label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-[#6B6B6B] hover:text-[#D4D4D4] py-2 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/TaskForm.tsx
git commit -m "feat: TaskForm warmer inputs, stacked button hierarchy"
```

---

## Task 11: Update MemberList Component

**Files:**
- Modify: `frontend/src/components/MemberList.tsx`

- [ ] **Step 1: Larger avatars, Lucide X, refined member rows**

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import Avatar from './Avatar';
import * as membersApi from '../api/members';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Props {
  members: Member[];
  projectId: string;
  isAdmin: boolean;
  onMembersChange: (members: Member[]) => void;
}

export default function MemberList({ members, projectId, isAdmin, onMembersChange }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!email.trim()) return;
    setError('');
    setAdding(true);
    try {
      const res = await membersApi.addMember(projectId, { email: email.trim(), role: 'MEMBER' });
      onMembersChange([...members, res.data.member]);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to add member');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      await membersApi.removeMember(projectId, userId);
      onMembersChange(members.filter((m) => m.userId !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to remove member');
    }
  }

  return (
    <div>
      <h3 className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-3">
        Members ({members.length})
      </h3>

      {error && (
        <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-1.5 mb-3">
          <p className="text-[#CD4945] text-xs">{error}</p>
        </div>
      )}

      <ul className="space-y-1 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 py-1 group">
            <Avatar name={m.user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#D4D4D4] truncate">{m.user.name}</p>
              <p className="text-[11px] text-[#6B6B6B] truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  m.role === 'ADMIN'
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-white/8 text-[#6B6B6B]'
                }`}
              >
                {m.role}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-[#CD4945] transition-all"
                  title="Remove member"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isAdmin && (
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            className="flex-1 bg-[#373C3F] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/MemberList.tsx
git commit -m "feat: MemberList larger avatars, Lucide X, Notion styling"
```

---

## Task 12: Update Login Page

**Files:**
- Modify: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: Warmer colors, Framer Motion card entry, Lucide eye icons**

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg">TeamTask</span>
          </div>

          <div className="bg-[#2F3437] border border-white/10 rounded-xl p-8">
            <h1 className="text-white text-xl font-semibold mb-1">Sign in</h1>
            <p className="text-[#9B9B9B] text-sm mb-6">Welcome back to TeamTask</p>

            {error && (
              <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-[#CD4945] text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B6B6B] mt-4">
            No account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Login.tsx
git commit -m "feat: Login page warm Notion colors + Framer entry animation"
```

---

## Task 13: Update Signup Page

**Files:**
- Modify: `frontend/src/pages/Signup.tsx`

- [ ] **Step 1: Mirror Login changes — warm colors, Framer Motion, Lucide icons**

```tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.signup({ name, email, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg">TeamTask</span>
          </div>

          <div className="bg-[#2F3437] border border-white/10 rounded-xl p-8">
            <h1 className="text-white text-xl font-semibold mb-1">Create account</h1>
            <p className="text-[#9B9B9B] text-sm mb-6">Get started with TeamTask</p>

            {error && (
              <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-[#CD4945] text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                  Password <span className="normal-case font-normal text-[#454B4E]">(min 8 chars)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[#6B6B6B] mt-4">
            Have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Signup.tsx
git commit -m "feat: Signup page warm Notion colors + Framer entry animation"
```

---

## Task 14: Update Dashboard Page

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Animated rows, mobile card list, warm colors, structured skeleton**

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { getDashboard } from '../api/dashboard';

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  overdue: boolean;
  project: { id: string; name: string };
}

interface Summary {
  total: number;
  inProgress: number;
  overdue: number;
}

function SkeletonRow() {
  return (
    <tr className="border-t border-white/[0.06]">
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-3/4" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-1/2" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-[#373C3F] rounded animate-pulse w-20" /></td>
      <td className="px-4 py-3"><div className="h-5 bg-[#373C3F] rounded animate-pulse w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-[#373C3F] rounded animate-pulse w-20" /></td>
    </tr>
  );
}

function MobileTaskCard({ task, index }: { task: DashboardTask; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={() => navigate(`/projects/${task.project.id}/tasks/${task.id}`)}
      className={`bg-[#2F3437] border border-white/10 rounded-xl p-4 cursor-pointer active:bg-[#373C3F] ${
        task.overdue ? 'border-l-2 border-l-[#CD4945]' : ''
      }`}
    >
      <p className="text-[14px] font-medium text-[#D4D4D4] mb-1.5">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          to={`/projects/${task.project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
        >
          {task.project.name}
        </Link>
        <span className="text-[#454B4E]">·</span>
        <Badge type="status" value={task.status} />
      </div>
      {(task.dueDate || task.priority !== 'LOW') && (
        <div className="flex items-center gap-2 mt-1.5">
          <Badge type="priority" value={task.priority} />
          {task.dueDate && (
            <span className={`text-[11px] ${task.overdue ? 'text-[#CD4945]' : 'text-[#6B6B6B]'}`}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {task.overdue && ' · Overdue'}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, inProgress: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => {
        setTasks(res.data.tasks);
        setSummary(res.data.summary);
      })
      .finally(() => setLoading(false));
  }, []);

  const metaPills = (
    <div className="flex items-center gap-2">
      <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
        <span className="text-[#D4D4D4] font-medium">{summary.total}</span> total
      </span>
      <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
        <span className="text-[#447ACB] font-medium">{summary.inProgress}</span> in progress
      </span>
      {summary.overdue > 0 && (
        <span className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-full px-3 py-1 text-xs">
          <span className="text-[#CD4945] font-medium">{summary.overdue}</span>
          <span className="text-[#CD4945]/70"> overdue</span>
        </span>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader title="My Tasks" meta={metaPills} />

      <div className="px-6 py-6">
        {loading ? (
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:block bg-[#2F3437] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-[#2F3437] rounded-xl animate-pulse" />
              ))}
            </div>
          </>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            heading="No tasks assigned to you"
            subtext="Tasks assigned to you across all projects will appear here"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[#2F3437] border border-white/[0.08] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {tasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => navigate(`/projects/${task.project.id}/tasks/${task.id}`)}
                        className={`border-t border-white/[0.06] hover:bg-[#373C3F] transition-colors cursor-pointer ${
                          task.overdue ? 'border-l-2 border-l-[#CD4945]' : ''
                        }`}
                      >
                        <td className="px-4 py-3 w-[40%]">
                          <span
                            className="text-[#D4D4D4] hover:text-white font-medium transition-colors"
                          >
                            {task.title}
                          </span>
                        </td>
                        <td className="px-4 py-3 w-[20%]">
                          <Link
                            to={`/projects/${task.project.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#9B9B9B] hover:text-[#D4D4D4] transition-colors"
                          >
                            {task.project.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 w-[15%]">
                          <Badge type="status" value={task.status} />
                        </td>
                        <td className="px-4 py-3 w-[12%]">
                          <Badge type="priority" value={task.priority} />
                        </td>
                        <td className="px-4 py-3 w-[13%] text-[#6B6B6B] text-xs">
                          {task.dueDate ? (
                            <span className={task.overdue ? 'text-[#CD4945] font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {task.overdue && ' · Overdue'}
                            </span>
                          ) : (
                            <span className="text-[#454B4E]">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {tasks.map((task, index) => (
                <MobileTaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
```

Note: `PageHeader` no longer accepts a `meta` prop based on Task 8's rewrite. Move the meta pills into the page body as a row above the table instead:

Replace `<PageHeader title="My Tasks" meta={metaPills} />` with:
```tsx
<PageHeader title="My Tasks" />
```
And add the pills as a `<div>` row at the top of the `px-6 py-6` section:
```tsx
<div className="px-6 pt-5 pb-3 flex items-center gap-2 flex-wrap">
  {metaPills children directly}
</div>
```

- [ ] **Step 2: Apply the meta pills adjustment** — move pills out of PageHeader into page body:

In `Dashboard.tsx`, replace the PageHeader + pills area with:

```tsx
<PageHeader title="My Tasks" />

<div className="px-6 pt-5 pb-1 flex items-center gap-2 flex-wrap">
  <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
    <span className="text-[#D4D4D4] font-medium">{summary.total}</span> total
  </span>
  <span className="bg-[#2F3437] border border-white/[0.08] rounded-full px-3 py-1 text-xs text-[#9B9B9B]">
    <span className="text-[#447ACB] font-medium">{summary.inProgress}</span> in progress
  </span>
  {summary.overdue > 0 && (
    <span className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-full px-3 py-1 text-xs">
      <span className="text-[#CD4945] font-medium">{summary.overdue}</span>
      <span className="text-[#CD4945]/70"> overdue</span>
    </span>
  )}
</div>
```

And remove the `metaPills` variable and the `meta` prop from PageHeader entirely in this file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: Dashboard animated rows, mobile card list, Notion colors"
```

---

## Task 15: Update Projects Page

**Files:**
- Modify: `frontend/src/pages/Projects.tsx`

- [ ] **Step 1: Animated cards with hover lift, warm Notion colors, Framer modal**

```tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FolderOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import * as projectsApi from '../api/projects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

const inputClass = 'w-full bg-[#373C3F] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none focus:border-[#447ACB] transition-colors';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    projectsApi.listProjects().then((res) => setProjects(res.data.projects));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await projectsApi.createProject({ name, description });
      setProjects((prev) => [...prev, { ...res.data.project, role: 'ADMIN' }]);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  const actionButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
    >
      <Plus size={16} />
      New Project
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader title="Projects" action={actionButton} />

      <div className="px-6 py-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            heading="No projects yet"
            subtext="Create a project to start managing tasks with your team"
            action={
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                <Plus size={14} />
                New Project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="block bg-[#2F3437] border border-white/10 hover:border-white/20 hover:shadow-lg rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-semibold text-white text-[15px] group-hover:text-white leading-tight">
                      {project.name}
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ml-2 mt-0.5 ${
                        project.role === 'ADMIN'
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-white/8 text-[#6B6B6B]'
                      }`}
                    >
                      {project.role}
                    </span>
                  </div>
                  {project.description ? (
                    <p className="text-[13px] text-[#9B9B9B] line-clamp-2">{project.description}</p>
                  ) : (
                    <p className="text-[13px] text-[#454B4E]">No description</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => { setShowModal(false); setError(''); }}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-[#2F3437] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">New Project</h2>
                  <button
                    onClick={() => { setShowModal(false); setError(''); }}
                    className="text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {error && (
                  <div className="bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-3 py-2 mb-4">
                    <p className="text-[#CD4945] text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                      Project name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="My Project"
                      className={inputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-1.5">
                      Description <span className="normal-case font-normal text-[#454B4E]">optional</span>
                    </label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this project about?"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setError(''); }}
                      className="w-full text-[#6B6B6B] hover:text-[#D4D4D4] py-2 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Projects.tsx
git commit -m "feat: Projects animated cards, hover lift, Framer modal"
```

---

## Task 16: Update ProjectDetail Page (Kanban)

**Files:**
- Modify: `frontend/src/pages/ProjectDetail.tsx`

- [ ] **Step 1: Notion column styles, responsive kanban, Framer Modal, warm colors**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import MemberList from '../components/MemberList';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';

const COLUMNS = [
  { key: 'TODO', label: 'Todo' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
] as const;

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  members: Member[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  // Mobile: which column accordion is open
  const [openColumn, setOpenColumn] = useState<string>('TODO');

  const myMembership = project?.members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    Promise.all([projectsApi.getProject(id), tasksApi.listTasks(id)])
      .then(([projRes, tasksRes]) => {
        setProject(projRes.data.project);
        setTasks(tasksRes.data.tasks);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCreateTask(data: {
    title: string; description: string; priority: string; dueDate: string; assigneeId: string;
  }) {
    const res = await tasksApi.createTask(id!, {
      ...data,
      dueDate: data.dueDate || undefined,
      assigneeId: data.assigneeId || undefined,
    });
    setTasks((prev) => [...prev, res.data.task]);
    setShowTaskForm(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919]">
        <div className="h-12 border-b border-white/[0.08] animate-pulse bg-[#2F3437]" />
        <div className="px-6 py-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-[#2F3437] rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Project not found.</p>
      </div>
    );
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowMembers(!showMembers)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
          showMembers
            ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
            : 'border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] hover:bg-[#2F3437]'
        }`}
      >
        <Users size={14} />
        <span className="hidden sm:inline">Members ({project.members.length})</span>
      </button>
      {isAdmin && (
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader
        title={project.name}
        breadcrumb="Projects"
        action={headerAction}
      />

      <div className="flex gap-0 min-h-[calc(100vh-48px)]">
        {/* Kanban board */}
        <div className={`flex-1 px-6 py-6 min-w-0 transition-all ${showMembers ? 'lg:pr-4' : ''}`}>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:flex gap-4 h-full">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="flex flex-col flex-1 min-w-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-semibold text-[#D4D4D4]">{col.label}</h3>
                    <span className="bg-[#454B4E] text-[#9B9B9B] text-xs px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column body */}
                  <div className="flex-1 bg-[#2F3437]/40 border border-white/[0.06] rounded-xl p-2 min-h-[400px] overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {colTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <TaskCard task={task} projectId={project.id} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {colTasks.length === 0 && !(col.key === 'TODO' && isAdmin) && (
                      <div className="flex items-center justify-center h-24">
                        <p className="text-xs text-[#454B4E]">No tasks</p>
                      </div>
                    )}

                    {col.key === 'TODO' && isAdmin && (
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="mt-2 flex items-center gap-1.5 w-full px-2 py-2 text-xs text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] rounded-lg transition-colors"
                      >
                        <Plus size={12} />
                        Add task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: accordion columns */}
          <div className="md:hidden space-y-3">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              const isOpen = openColumn === col.key;
              return (
                <div key={col.key} className="bg-[#2F3437]/40 border border-white/[0.06] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenColumn(isOpen ? '' : col.key)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-[#D4D4D4]">{col.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#454B4E] text-[#9B9B9B] text-xs px-2 py-0.5 rounded-full">
                        {colTasks.length}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-[#6B6B6B] text-xs"
                      >
                        ›
                      </motion.span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {colTasks.map((task) => (
                            <TaskCard key={task.id} task={task} projectId={project.id} />
                          ))}
                          {colTasks.length === 0 && (
                            <p className="text-xs text-[#454B4E] text-center py-4">No tasks</p>
                          )}
                          {col.key === 'TODO' && isAdmin && (
                            <button
                              onClick={() => setShowTaskForm(true)}
                              className="flex items-center gap-1.5 w-full px-2 py-2 text-xs text-[#6B6B6B] hover:text-[#D4D4D4] hover:bg-[#3F4448] rounded-lg transition-colors"
                            >
                              <Plus size={12} />
                              Add task
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Members panel */}
        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-white/[0.08] shrink-0 overflow-hidden"
            >
              <div className="w-72 px-5 py-5">
                <MemberList
                  members={project.members}
                  projectId={project.id}
                  isAdmin={isAdmin ?? false}
                  onMembersChange={(updated) =>
                    setProject((p) => (p ? { ...p, members: updated } : p))
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setShowTaskForm(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="bg-[#2F3437] border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-white font-semibold">New Task</h2>
                  <button
                    onClick={() => setShowTaskForm(false)}
                    className="text-[#6B6B6B] hover:text-[#D4D4D4] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <TaskForm
                  members={project.members}
                  onSubmit={handleCreateTask}
                  onCancel={() => setShowTaskForm(false)}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/ProjectDetail.tsx
git commit -m "feat: ProjectDetail Notion kanban, mobile accordion, Framer modal"
```

---

## Task 17: Update TaskDetail Page

**Files:**
- Modify: `frontend/src/pages/TaskDetail.tsx`

- [ ] **Step 1: Larger title, warm colors, refined metadata sidebar, Lucide icons**

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Lock } from 'lucide-react';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}

interface Member {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
}

const selectClass = 'w-full bg-[#373C3F] border-none rounded-lg px-3 py-2 text-sm text-[#D4D4D4] focus:outline-none focus:ring-1 focus:ring-[#447ACB] transition-colors';
const sectionLabel = 'text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-widest mb-2';

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const myMembership = members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id || !taskId) return;
    Promise.all([tasksApi.getTask(id, taskId), projectsApi.getProject(id)])
      .then(([taskRes, projRes]) => {
        const t = taskRes.data.task;
        setTask(t);
        setMembers(projRes.data.project.members);
        setProjectName(projRes.data.project.name);
        setTitle(t.title);
        setDescription(t.description ?? '');
        setStatus(t.status);
        setPriority(t.priority);
        setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
        setAssigneeId(t.assignee?.id ?? '');
      })
      .finally(() => setLoading(false));
  }, [id, taskId]);

  async function saveField(field: object) {
    setSaving(true);
    setError('');
    try {
      const res = await tasksApi.updateTask(id!, taskId!, field);
      setTask(res.data.task);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await tasksApi.deleteTask(id!, taskId!);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete');
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919]">
        <div className="h-12 border-b border-white/[0.08] animate-pulse bg-[#2F3437]" />
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#2F3437] rounded-lg animate-pulse" />
            <div className="h-32 bg-[#2F3437] rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-[#2F3437] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#191919] flex items-center justify-center">
        <p className="text-[#6B6B6B]">Task not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="min-h-screen bg-[#191919]"
    >
      <PageHeader
        title={task.title}
        breadcrumb={projectName}
        action={
          isAdmin ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#CD4945] hover:text-red-300 border border-[#CD4945]/20 hover:border-[#CD4945]/40 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mx-6 mt-4 bg-[#CD4945]/10 border border-[#CD4945]/20 rounded-lg px-4 py-2">
          <p className="text-[#CD4945] text-sm">{error}</p>
        </div>
      )}

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Title + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back link */}
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#D4D4D4] text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            {projectName}
          </Link>

          {/* Title */}
          <div>
            {editingTitle && isAdmin ? (
              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-[#2F3437] border border-[#447ACB] rounded-lg px-3 py-2 text-2xl font-semibold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => { saveField({ title }); setEditingTitle(false); }}
                  disabled={saving}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setTitle(task.title); setEditingTitle(false); }}
                  className="px-3 py-2 border border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                className={`text-2xl font-semibold text-white ${isAdmin ? 'cursor-pointer hover:text-[#D4D4D4]' : ''} transition-colors`}
                onClick={() => isAdmin && setEditingTitle(true)}
                title={isAdmin ? 'Click to edit' : undefined}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <p className={sectionLabel}>Description</p>
            {editingDescription && isAdmin ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Add a description..."
                  className="w-full bg-[#2F3437] border border-[#447ACB] rounded-xl px-4 py-3 text-sm text-[#D4D4D4] placeholder-[#6B6B6B] focus:outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { saveField({ description }); setEditingDescription(false); }}
                    disabled={saving}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setDescription(task.description ?? ''); setEditingDescription(false); }}
                    className="px-3 py-1.5 border border-white/[0.08] text-[#9B9B9B] hover:text-[#D4D4D4] rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`bg-[#2F3437] rounded-xl p-4 min-h-[120px] ${
                  isAdmin ? 'cursor-pointer hover:bg-[#373C3F]' : ''
                } transition-colors`}
                onClick={() => isAdmin && setEditingDescription(true)}
              >
                {task.description ? (
                  <p className="text-sm text-[#D4D4D4] whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-[#454B4E]">
                    {isAdmin ? 'Click to add description...' : 'No description'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="pt-4 border-t border-white/[0.06]">
            <p className="text-[12px] text-[#454B4E]">
              Created by <span className="text-[#6B6B6B]">{task.createdBy?.name}</span>
            </p>
          </div>
        </div>

        {/* Right: Metadata sidebar */}
        <div className="bg-[#2F3437] border border-white/10 rounded-xl p-5 h-fit">
          {/* Status */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>Status</p>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); saveField({ status: e.target.value }); }}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>
              Priority {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); saveField({ priority: e.target.value }); }}
                className={selectClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            ) : (
              <div className="px-1 py-1">
                <Badge type="priority" value={task.priority} />
              </div>
            )}
          </div>

          {/* Assignee */}
          <div className="py-3 border-b border-white/[0.06]">
            <p className={sectionLabel}>
              Assignee {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); saveField({ assigneeId: e.target.value || null }); }}
                className={selectClass}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            ) : (
              <div className="px-1 py-1 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar name={task.assignee.name} size="sm" />
                    <span className="text-sm text-[#D4D4D4]">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-[#454B4E]">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="py-3">
            <p className={sectionLabel}>
              Due Date {!isAdmin && <Lock size={10} className="inline ml-1 text-[#454B4E]" />}
            </p>
            {isAdmin ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); saveField({ dueDate: e.target.value || undefined }); }}
                className={selectClass}
              />
            ) : (
              <div className="px-1 py-1">
                <span className="text-sm text-[#D4D4D4]">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : <span className="text-[#454B4E]">Not set</span>
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Delete task"
          message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
          confirmLabel="Delete task"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/TaskDetail.tsx
git commit -m "feat: TaskDetail Notion style, larger title, refined metadata sidebar"
```

---

## Task 18: Fix PageHeader meta prop — remove from interface

The `PageHeader` rewrite in Task 8 removed the `meta` prop. Dashboard.tsx in Task 14 already handles this by rendering pills in the page body. Verify no other page passes `meta` to `PageHeader`.

**Files:**
- Verify: `frontend/src/pages/Dashboard.tsx` (should NOT pass `meta` to PageHeader)

- [ ] **Step 1: Check for stale `meta` prop usage**

```bash
grep -r "meta=" frontend/src/pages/
```

Expected: no results (or only in the pre-Task-14 state — should be cleaned up already).

- [ ] **Step 2: Build the app to verify no TypeScript errors**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 3: If any TS errors appear, fix them**

Common errors to watch for:
- `Property 'meta' does not exist on type 'PageHeaderProps'` — remove `meta` prop from any PageHeader call
- `Property 'open' does not exist on type 'SidebarProps'` — Sidebar now requires `open` + `onClose` props; these come from AppShell
- `useSidebarToggle` not found — ensure AppShell exports `SidebarToggleContext` and `useSidebarToggle`

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: resolve TypeScript errors from PageHeader/Sidebar prop changes"
```

---

## Task 19: Verify Dev Server and Visual Smoke Test

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run dev
```

Expected: Vite starts on `http://localhost:5173`, no console errors.

- [ ] **Step 2: Visual smoke test checklist**

Open `http://localhost:5173/login` and verify:
- [ ] Background is `#191919` (warm dark, not pure black)
- [ ] Login card appears with fade-in animation
- [ ] Input fields have `#373C3F` background (warm, not cold black)
- [ ] "Sign in" button is indigo, not blue

Open `/dashboard` and verify:
- [ ] Sidebar is visible on desktop, background `#373C3F` (warm slate)
- [ ] Sidebar has Lucide icons (LayoutDashboard, FolderOpen)
- [ ] Sidebar collapse toggle works (click chevron)
- [ ] On mobile (<768px), sidebar is hidden; hamburger in top bar opens it
- [ ] Top bar is sticky and blurs on scroll
- [ ] User avatar in top bar opens dropdown with "Sign out"
- [ ] Dashboard table rows animate in
- [ ] Overdue rows have red left border

Open `/projects` and verify:
- [ ] Project cards have warm `#2F3437` background
- [ ] Hovering a card lifts it slightly (y: -2)
- [ ] "New Project" modal has fade+scale animation
- [ ] Modal closes on backdrop click or X button

Open `/projects/:id` and verify:
- [ ] Kanban columns have subtle semi-transparent background
- [ ] On mobile, columns are stacked accordions
- [ ] Task cards have warm background, lift on hover
- [ ] Overdue tasks show "Overdue" red pill (not `!!`)
- [ ] Members panel slides in from right with animation

Open `/projects/:id/tasks/:taskId` and verify:
- [ ] Title is larger (2xl)
- [ ] Description area has warm card background
- [ ] Metadata sidebar has border-divided rows
- [ ] Lock icon appears for non-admin fields

- [ ] **Step 3: Final commit if any minor fixes were made**

```bash
git add -p
git commit -m "fix: smoke test fixes"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Color tokens (warm Notion greys) — Tasks 2, all pages
- [x] framer-motion + lucide-react — Task 1
- [x] Collapsible sidebar desktop — Task 7
- [x] Mobile overlay sidebar — Tasks 6, 7
- [x] Sticky blur PageHeader — Task 8
- [x] Mobile hamburger — Tasks 6, 7, 8
- [x] User avatar dropdown — Task 8
- [x] Badge dot indicator — Task 4
- [x] Avatar lg size — Task 3
- [x] EmptyState Lucide icon — Task 5
- [x] TaskCard hover lift, overdue pill — Task 9
- [x] TaskForm warmer inputs — Task 10
- [x] MemberList Lucide X, larger avatars — Task 11
- [x] Login/Signup Framer entry, Lucide icons — Tasks 12, 13
- [x] Dashboard animated rows, mobile card list, skeleton — Task 14
- [x] Projects animated cards, Framer modal — Task 15
- [x] ProjectDetail responsive kanban (3-col desktop, accordion mobile) — Task 16
- [x] TaskDetail larger title, metadata border-rows — Task 17
- [x] TypeScript compile check — Task 18
- [x] Visual smoke test — Task 19

**Type consistency check:**
- `Sidebar` now requires `{ open: boolean; onClose: () => void }` — passed from `AppShell` ✓
- `PageHeader` interface is `{ title, breadcrumb?, action? }` — `meta` prop removed; Dashboard handles pills inline ✓
- `Avatar` sizes: `'sm' | 'md' | 'lg'` — used as `md` in MemberList, `lg` available for future use ✓
- `EmptyState` now takes `icon?: LucideIcon` — Dashboard passes `CheckSquare`, Projects passes `FolderOpen` ✓
- `useSidebarToggle` exported from `AppShell.tsx`, imported in `PageHeader.tsx` ✓
