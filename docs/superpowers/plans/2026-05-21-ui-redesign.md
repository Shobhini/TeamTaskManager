# UI Redesign Implementation Plan

**Goal:** Replace the current light indigo theme with a Linear/Vercel-style dark SaaS UI — fixed dark sidebar, blue + emerald accent colors, Inter font, polished dark cards and typography throughout.

**Architecture:** Pure frontend visual overhaul. Add a fixed 240px dark sidebar (`Sidebar.tsx`) and `AppShell.tsx` shell component that wraps all authenticated pages. Replace `Navbar.tsx` and `StatusBadge.tsx` with new `Badge.tsx`, `Avatar.tsx`, `EmptyState.tsx`, `ConfirmModal.tsx`, `PageHeader.tsx`. Update all pages and components to use dark color tokens. No backend changes.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, react-router-dom v7, Inter font (Google Fonts).

---

## File Map

### New Files
| File | Responsibility |
|---|---|
| `frontend/src/components/Sidebar.tsx` | Fixed dark left sidebar: logo, nav links, project list, user block with logout |
| `frontend/src/components/AppShell.tsx` | Layout wrapper: Sidebar + `<main ml-60>` content area |
| `frontend/src/components/PageHeader.tsx` | Reusable top bar: title/breadcrumb + optional action button |
| `frontend/src/components/Badge.tsx` | Status AND priority badges with dark theme variants |
| `frontend/src/components/Avatar.tsx` | Initials circle with color derived from name hash |
| `frontend/src/components/EmptyState.tsx` | Centered icon + heading + subtext for empty lists |
| `frontend/src/components/ConfirmModal.tsx` | Dark confirmation dialog — replaces browser `confirm()` |

### Updated Files
| File | What changes |
|---|---|
| `frontend/index.html` | Add Inter Google Fonts link |
| `frontend/src/components/ProtectedRoute.tsx` | Wrap children in `<AppShell>` |
| `frontend/src/components/TaskCard.tsx` | Dark bg, left priority border accent, Avatar for assignee |
| `frontend/src/components/TaskForm.tsx` | Dark inputs, date min=today, clearer labels |
| `frontend/src/components/MemberList.tsx` | Dark styling, Avatar per member, loading state on Add |
| `frontend/src/pages/Login.tsx` | Full dark redesign, eye toggle, dark card |
| `frontend/src/pages/Signup.tsx` | Full dark redesign, dark card |
| `frontend/src/pages/Dashboard.tsx` | Dark table, left-border overdue, EmptyState, PageHeader |
| `frontend/src/pages/Projects.tsx` | Dark cards, PageHeader, dark modal |
| `frontend/src/pages/ProjectDetail.tsx` | Dark Kanban, collapsible members panel, PageHeader |
| `frontend/src/pages/TaskDetail.tsx` | Two-column dark layout, ConfirmModal, PageHeader |

### Deleted Files
| File | Replacement |
|---|---|
| `frontend/src/components/Navbar.tsx` | `Sidebar.tsx` + `AppShell.tsx` |
| `frontend/src/components/StatusBadge.tsx` | `Badge.tsx` |

---

## Task 1: Inter Font + Design Token Setup

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Add Inter font to index.html**

Read `frontend/index.html`. Add the Google Fonts preconnect + stylesheet inside `<head>` before the existing content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>TeamTask</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Set Inter as default font in index.css**

Replace `frontend/src/index.css` entirely:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: #111111;
    color: #F5F5F5;
  }

  * {
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #111111;
  }

  ::-webkit-scrollbar-thumb {
    background: #2A2A2A;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #3A3A3A;
  }
}
```

- [ ] **Step 3: Verify build still passes**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | tail -5
```

Expected: Build succeeds, no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/index.html frontend/src/index.css
git commit -m "feat: add Inter font and dark base styles"
```

---

## Task 2: New Primitive Components (Badge, Avatar, EmptyState, ConfirmModal, PageHeader)

**Files:**
- Create: `frontend/src/components/Badge.tsx`
- Create: `frontend/src/components/Avatar.tsx`
- Create: `frontend/src/components/EmptyState.tsx`
- Create: `frontend/src/components/ConfirmModal.tsx`
- Create: `frontend/src/components/PageHeader.tsx`
- Delete: `frontend/src/components/StatusBadge.tsx`

- [ ] **Step 1: Create Badge.tsx**

Create `frontend/src/components/Badge.tsx`:

```typescript
type StatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';

const statusStyles: Record<StatusType, string> = {
  TODO: 'bg-zinc-800 text-zinc-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-400',
  DONE: 'bg-emerald-500/15 text-emerald-400',
};

const priorityStyles: Record<PriorityType, string> = {
  HIGH: 'bg-red-500/15 text-red-400',
  MEDIUM: 'bg-amber-500/15 text-amber-400',
  LOW: 'bg-zinc-800 text-zinc-500',
};

const statusLabels: Record<StatusType, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export default function Badge({ type, value }: BadgeProps) {
  const styles =
    type === 'status'
      ? statusStyles[value as StatusType] ?? 'bg-zinc-800 text-zinc-400'
      : priorityStyles[value as PriorityType] ?? 'bg-zinc-800 text-zinc-400';

  const label =
    type === 'status'
      ? statusLabels[value as StatusType] ?? value
      : value.charAt(0) + value.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-mono ${styles}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create Avatar.tsx**

Create `frontend/src/components/Avatar.tsx`:

```typescript
const COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-violet-500/20 text-violet-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400',
  'bg-cyan-500/20 text-cyan-400',
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
  size?: 'sm' | 'md';
}

export default function Avatar({ name, size = 'sm' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
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

- [ ] **Step 3: Create EmptyState.tsx**

Create `frontend/src/components/EmptyState.tsx`:

```typescript
interface EmptyStateProps {
  icon?: string;
  heading: string;
  subtext?: string;
}

export default function EmptyState({ icon = '○', heading, subtext }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl text-zinc-700 mb-4">{icon}</span>
      <p className="text-zinc-400 font-medium">{heading}</p>
      {subtext && <p className="text-zinc-600 text-sm mt-1">{subtext}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Create ConfirmModal.tsx**

Create `frontend/src/components/ConfirmModal.tsx`:

```typescript
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-[#F5F5F5] font-semibold mb-2">{title}</h2>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-[#2A2A2A] rounded-lg hover:bg-[#222222] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              danger
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create PageHeader.tsx**

Create `frontend/src/components/PageHeader.tsx`:

```typescript
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  action?: ReactNode;
  meta?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, action, meta }: PageHeaderProps) {
  return (
    <div className="px-8 py-5 border-b border-[#2A2A2A] flex items-center justify-between">
      <div>
        {breadcrumb && (
          <p className="text-xs text-zinc-500 mb-1">{breadcrumb}</p>
        )}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#F5F5F5]">{title}</h1>
          {meta && <div className="flex items-center gap-2">{meta}</div>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 6: Delete StatusBadge.tsx**

```bash
rm /Users/shobs/Downloads/TeamTaskManager/frontend/src/components/StatusBadge.tsx
```

- [ ] **Step 7: Verify build**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | tail -10
```

Expected: Build may fail because Dashboard.tsx still imports StatusBadge — that's okay for now, we'll fix it in later tasks. If it fails ONLY on StatusBadge imports, proceed. If other errors appear, fix them.

- [ ] **Step 8: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components/Badge.tsx frontend/src/components/Avatar.tsx frontend/src/components/EmptyState.tsx frontend/src/components/ConfirmModal.tsx frontend/src/components/PageHeader.tsx
git rm frontend/src/components/StatusBadge.tsx
git commit -m "feat: add Badge, Avatar, EmptyState, ConfirmModal, PageHeader components"
```

---

## Task 3: Sidebar + AppShell + ProtectedRoute

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/components/AppShell.tsx`
- Modify: `frontend/src/components/ProtectedRoute.tsx`
- Delete: `frontend/src/components/Navbar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

Create `frontend/src/components/Sidebar.tsx`:

```typescript
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listProjects } from '../api/projects';
import Avatar from './Avatar';

interface Project {
  id: string;
  name: string;
  role: string;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    listProjects()
      .then((res) => setProjects(res.data.projects))
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-500/15 text-blue-400 font-medium'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#2A2A2A]">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">TT</span>
          </div>
          <span className="text-[#F5F5F5] font-semibold text-sm">TeamTask</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={navItemClass}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={navItemClass}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Projects
        </NavLink>
      </nav>

      {/* Project list */}
      {projects.length > 0 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-2">
            My Projects
          </p>
          <div className="space-y-0.5">
            {projects.slice(0, 8).map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#1A1A1A]'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span className="truncate">{p.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* User block */}
      <div className="mt-auto border-t border-[#2A2A2A] p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.email ?? 'U'} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create AppShell.tsx**

Create `frontend/src/components/AppShell.tsx`:

```typescript
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#111111]">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Update ProtectedRoute.tsx**

Replace `frontend/src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';
import type { ReactNode } from 'react';

interface DecodedToken {
  exp: number;
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 4: Delete Navbar.tsx**

```bash
rm /Users/shobs/Downloads/TeamTaskManager/frontend/src/components/Navbar.tsx
```

- [ ] **Step 5: Verify build (expect Navbar import errors in pages — we'll fix next)**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: Errors only about `Navbar` imports and `StatusBadge` imports in pages. No other errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components/Sidebar.tsx frontend/src/components/AppShell.tsx frontend/src/components/ProtectedRoute.tsx
git rm frontend/src/components/Navbar.tsx
git commit -m "feat: add Sidebar, AppShell; update ProtectedRoute to wrap with AppShell"
```

---

## Task 4: Login & Signup Pages (Dark Redesign)

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Signup.tsx`

- [ ] **Step 1: Replace Login.tsx**

Replace the entire contents of `frontend/src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">TT</span>
          </div>
          <span className="text-[#F5F5F5] font-semibold text-lg">TeamTask</span>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
          <h1 className="text-[#F5F5F5] text-xl font-semibold mb-1">Sign in</h1>
          <p className="text-zinc-500 text-sm mb-6">Welcome back to TeamTask</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 pr-10 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          No account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace Signup.tsx**

Replace the entire contents of `frontend/src/pages/Signup.tsx`:

```typescript
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">TT</span>
          </div>
          <span className="text-[#F5F5F5] font-semibold text-lg">TeamTask</span>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
          <h1 className="text-[#F5F5F5] text-xl font-semibold mb-1">Create account</h1>
          <p className="text-zinc-500 text-sm mb-6">Get started with TeamTask</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password <span className="text-zinc-600">(min 8 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 pr-10 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          Have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build (expect errors from other pages that still import Navbar/StatusBadge)**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep -v "StatusBadge\|Navbar" | grep -E "error|Error" | head -10
```

Expected: Only StatusBadge/Navbar errors remain. Login and Signup themselves should be clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/Login.tsx frontend/src/pages/Signup.tsx
git commit -m "feat: dark redesign for Login and Signup pages"
```

---

## Task 5: Dashboard Page (Dark Redesign)

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Replace Dashboard.tsx**

Replace the entire contents of `frontend/src/pages/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Dashboard() {
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
      <span className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1 text-xs text-zinc-400">
        <span className="text-[#F5F5F5] font-medium">{summary.total}</span> total
      </span>
      <span className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-3 py-1 text-xs text-zinc-400">
        <span className="text-blue-400 font-medium">{summary.inProgress}</span> in progress
      </span>
      {summary.overdue > 0 && (
        <span className="bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 text-xs">
          <span className="text-red-400 font-medium">{summary.overdue}</span>
          <span className="text-red-400/70"> overdue</span>
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader title="My Tasks" meta={metaPills} />

      <div className="px-8 py-6">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[#1A1A1A] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="✓"
            heading="No tasks assigned to you"
            subtext="Tasks assigned to you will appear here"
          />
        ) : (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`border-t border-[#2A2A2A] hover:bg-[#222222] transition-colors ${
                      task.overdue ? 'border-l-2 border-l-red-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}/tasks/${task.id}`}
                        className="text-[#F5F5F5] hover:text-blue-400 font-medium transition-colors"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}`}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge type="status" value={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge type="priority" value={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {task.dueDate ? (
                        <span className={task.overdue ? 'text-red-400 font-medium' : ''}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {task.overdue && ' · Overdue'}
                        </span>
                      ) : (
                        <span className="text-zinc-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep -E "error TS" | head -10
```

Expected: No TypeScript errors in Dashboard.tsx. Other files may still have Navbar/StatusBadge errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: dark redesign for Dashboard page"
```

---

## Task 6: Projects List Page (Dark Redesign)

**Files:**
- Modify: `frontend/src/pages/Projects.tsx`

- [ ] **Step 1: Replace Projects.tsx**

Replace the entire contents of `frontend/src/pages/Projects.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import * as projectsApi from '../api/projects';

interface Project {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

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
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New Project
    </button>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader title="Projects" action={actionButton} />

      <div className="px-8 py-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl text-zinc-700 mb-4">◫</span>
            <p className="text-zinc-400 font-medium">No projects yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create a project to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-[#1A1A1A] border border-[#2A2A2A] hover:border-blue-500/40 rounded-xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-semibold text-[#F5F5F5] group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md font-mono font-medium shrink-0 ml-2 ${
                      project.role === 'ADMIN'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {project.role}
                  </span>
                </div>
                {project.description ? (
                  <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
                ) : (
                  <p className="text-sm text-zinc-700">No description</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-[#F5F5F5] font-semibold mb-5">New Project</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Project"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Description <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this project about?"
                  className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="flex-1 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222] py-2 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep "error TS" | head -10
```

Expected: No errors in Projects.tsx.

- [ ] **Step 3: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/Projects.tsx
git commit -m "feat: dark redesign for Projects list page"
```

---

## Task 7: Updated TaskCard, TaskForm, MemberList Components

**Files:**
- Modify: `frontend/src/components/TaskCard.tsx`
- Modify: `frontend/src/components/TaskForm.tsx`
- Modify: `frontend/src/components/MemberList.tsx`

- [ ] **Step 1: Replace TaskCard.tsx**

Replace the entire contents of `frontend/src/components/TaskCard.tsx`:

```typescript
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Avatar from './Avatar';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

const priorityBorder: Record<string, string> = {
  HIGH: 'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW: '',
};

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const borderAccent = priorityBorder[task.priority] ?? '';

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className={`block bg-[#1A1A1A] border border-[#2A2A2A] hover:border-zinc-600 rounded-lg p-3 transition-colors border-l-2 ${
        borderAccent || 'border-l-[#2A2A2A]'
      }`}
    >
      <p className="text-sm font-medium text-[#F5F5F5] mb-2 leading-snug">{task.title}</p>
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <Badge type="status" value={task.status} />
        <Badge type="priority" value={task.priority} />
      </div>
      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} size="sm" />
            <span className="text-xs text-zinc-500 truncate max-w-[80px]">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-700">Unassigned</span>
        )}
        {task.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-zinc-600'}`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && ' ·  !!'}
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Replace TaskForm.tsx**

Replace the entire contents of `frontend/src/components/TaskForm.tsx`:

```typescript
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

const inputClass = 'w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-zinc-400 mb-1.5';

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
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <div>
        <label className={labelClass}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Task title"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description <span className="text-zinc-600">(optional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Add details..."
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={inputClass}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Due date <span className="text-zinc-600">(optional)</span></label>
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
        <label className={labelClass}>Assign to <span className="text-zinc-600">(optional)</span></label>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className={inputClass}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222] py-2 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Replace MemberList.tsx**

Replace the entire contents of `frontend/src/components/MemberList.tsx`:

```typescript
import { useState } from 'react';
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
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Members ({members.length})
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 mb-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <ul className="space-y-2 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5 group">
            <Avatar name={m.user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{m.user.name}</p>
              <p className="text-xs text-zinc-600 truncate">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                  m.role === 'ADMIN'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {m.role}
              </span>
              {isAdmin && (
                <button
                  onClick={() => handleRemove(m.userId)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                  title="Remove member"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
            className="flex-1 bg-[#111111] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep "error TS" | head -10
```

Expected: No errors in TaskCard, TaskForm, MemberList. Remaining errors should only be in ProjectDetail.tsx and TaskDetail.tsx (still importing Navbar/StatusBadge).

- [ ] **Step 5: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components/TaskCard.tsx frontend/src/components/TaskForm.tsx frontend/src/components/MemberList.tsx
git commit -m "feat: dark redesign for TaskCard, TaskForm, MemberList components"
```

---

## Task 8: Project Detail Page (Dark Kanban Redesign)

**Files:**
- Modify: `frontend/src/pages/ProjectDetail.tsx`

- [ ] **Step 1: Replace ProjectDetail.tsx**

Replace the entire contents of `frontend/src/pages/ProjectDetail.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import MemberList from '../components/MemberList';
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
      <div className="min-h-screen bg-[#111111]">
        <div className="px-8 py-5 border-b border-[#2A2A2A] h-16 animate-pulse bg-[#1A1A1A]" />
        <div className="px-8 py-6 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-[#1A1A1A] rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-zinc-500">Project not found.</p>
      </div>
    );
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowMembers(!showMembers)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
          showMembers
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
            : 'border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:bg-[#222222]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        Members ({project.members.length})
      </button>
      {isAdmin && (
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader
        title={project.name}
        breadcrumb="Projects"
        action={headerAction}
      />

      <div className="flex gap-0">
        {/* Kanban board */}
        <div className={`flex-1 px-8 py-6 transition-all ${showMembers ? 'pr-4' : ''}`}>
          <div className="grid grid-cols-3 gap-4 h-full">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-medium text-zinc-400">{col.label}</h3>
                    <span className="bg-[#222222] text-zinc-500 text-xs font-mono px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2 flex-1">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} projectId={project.id} />
                    ))}
                  </div>

                  {/* Add task shortcut (TODO column, ADMIN only) */}
                  {col.key === 'TODO' && isAdmin && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-2 flex items-center gap-2 w-full px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add task
                    </button>
                  )}

                  {/* Empty column hint */}
                  {colTasks.length === 0 && !(col.key === 'TODO' && isAdmin) && (
                    <div className="border border-dashed border-[#2A2A2A] rounded-lg py-8 text-center">
                      <p className="text-xs text-zinc-700">No tasks</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Members panel */}
        {showMembers && (
          <div className="w-72 border-l border-[#2A2A2A] px-6 py-6 shrink-0">
            <MemberList
              members={project.members}
              projectId={project.id}
              isAdmin={isAdmin ?? false}
              onMembersChange={(updated) =>
                setProject((p) => (p ? { ...p, members: updated } : p))
              }
            />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-[#F5F5F5] font-semibold mb-5">New Task</h2>
            <TaskForm
              members={project.members}
              onSubmit={handleCreateTask}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1 | grep "error TS" | head -10
```

Expected: No errors in ProjectDetail.tsx. Only TaskDetail.tsx may still have issues.

- [ ] **Step 3: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/ProjectDetail.tsx
git commit -m "feat: dark Kanban redesign for ProjectDetail page"
```

---

## Task 9: Task Detail Page (Dark Two-Column Redesign)

**Files:**
- Modify: `frontend/src/pages/TaskDetail.tsx`

- [ ] **Step 1: Replace TaskDetail.tsx**

Replace the entire contents of `frontend/src/pages/TaskDetail.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const inputClass = 'w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-blue-500 transition-colors';

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

  // Edit state
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
      <div className="min-h-screen bg-[#111111]">
        <div className="h-16 border-b border-[#2A2A2A] animate-pulse bg-[#1A1A1A]" />
        <div className="px-8 py-6 grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="h-8 bg-[#1A1A1A] rounded animate-pulse" />
            <div className="h-32 bg-[#1A1A1A] rounded animate-pulse" />
          </div>
          <div className="h-64 bg-[#1A1A1A] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-zinc-500">Task not found.</p>
      </div>
    );
  }

  const breadcrumb = `Projects / ${projectName}`;

  return (
    <div className="min-h-screen bg-[#111111]">
      <PageHeader
        title={task.title}
        breadcrumb={breadcrumb}
        action={
          isAdmin ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mx-8 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="px-8 py-6 grid grid-cols-3 gap-8">
        {/* Left: Title + Description */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div>
            {editingTitle && isAdmin ? (
              <div className="flex gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 bg-[#1A1A1A] border border-blue-500 rounded-lg px-3 py-2 text-lg font-semibold text-[#F5F5F5] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => { saveField({ title }); setEditingTitle(false); }}
                  disabled={saving}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { setTitle(task.title); setEditingTitle(false); }}
                  className="px-3 py-2 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h2
                className={`text-xl font-semibold text-[#F5F5F5] ${isAdmin ? 'cursor-pointer hover:text-blue-400' : ''} transition-colors`}
                onClick={() => isAdmin && setEditingTitle(true)}
                title={isAdmin ? 'Click to edit' : undefined}
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Description</p>
            {editingDescription && isAdmin ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Add a description..."
                  className="w-full bg-[#1A1A1A] border border-blue-500 rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-zinc-600 focus:outline-none resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { saveField({ description }); setEditingDescription(false); }}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setDescription(task.description ?? ''); setEditingDescription(false); }}
                    className="px-3 py-1.5 border border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`min-h-[80px] p-3 rounded-lg border ${
                  isAdmin
                    ? 'border-[#2A2A2A] hover:border-zinc-600 cursor-pointer'
                    : 'border-transparent'
                } transition-colors`}
                onClick={() => isAdmin && setEditingDescription(true)}
              >
                {task.description ? (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-zinc-700">{isAdmin ? 'Click to add description...' : 'No description'}</p>
                )}
              </div>
            )}
          </div>

          {/* Creator */}
          <div className="pt-4 border-t border-[#2A2A2A]">
            <p className="text-xs text-zinc-600">
              Created by{' '}
              <span className="text-zinc-400">{task.createdBy?.name}</span>
            </p>
          </div>
        </div>

        {/* Right: Metadata sidebar */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 h-fit space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Status</p>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); saveField({ status: e.target.value }); }}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Priority — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Priority {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value); saveField({ priority: e.target.value }); }}
                className={inputClass}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2">
                <Badge type="priority" value={task.priority} />
              </div>
            )}
          </div>

          {/* Assignee — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Assignee {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <select
                value={assigneeId}
                onChange={(e) => { setAssigneeId(e.target.value); saveField({ assigneeId: e.target.value || null }); }}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 flex items-center gap-2">
                {task.assignee ? (
                  <>
                    <Avatar name={task.assignee.name} size="sm" />
                    <span className="text-sm text-zinc-300">{task.assignee.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-zinc-600">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Due Date — admin only editable */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Due Date {!isAdmin && <span className="text-zinc-700">🔒</span>}
            </p>
            {isAdmin ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => { setDueDate(e.target.value); saveField({ dueDate: e.target.value || undefined }); }}
                className={inputClass}
              />
            ) : (
              <div className="px-3 py-2">
                <span className="text-sm text-zinc-300">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : <span className="text-zinc-600">Not set</span>
                  }
                </span>
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="pt-2 border-t border-[#2A2A2A]">
            <Link
              to={`/projects/${id}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {projectName}
            </Link>
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
    </div>
  );
}
```

- [ ] **Step 2: Full build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1
```

Expected: **Full clean build with zero errors.** Fix any TypeScript errors found.

- [ ] **Step 3: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/TaskDetail.tsx
git commit -m "feat: dark two-column redesign for TaskDetail page"
```

---

## Task 10: Final Verification

**Files:** No new files — verification only.

- [ ] **Step 1: Full clean build**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build 2>&1
```

Expected: `✓ built in` with zero errors and zero TypeScript warnings.

- [ ] **Step 2: Run backend tests to confirm no regressions**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test 2>&1
```

Expected: All 19 tests still PASS.

- [ ] **Step 3: Check git log**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git log --oneline | head -15
```

Expected: Clean commit history with all redesign commits.

- [ ] **Step 4: Final commit if anything uncommitted**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git status
git add -A && git commit -m "chore: finalize UI redesign" 2>/dev/null || echo "Nothing to commit"
```

- [ ] **Step 5: Verify the app runs**

```bash
# Terminal 1
cd /Users/shobs/Downloads/TeamTaskManager/backend && npm run dev &

# Terminal 2
cd /Users/shobs/Downloads/TeamTaskManager/frontend && npm run dev
```

Open http://localhost:5173 — verify:
- Login page is full dark, centered card, Inter font
- After login, dark sidebar is visible on left
- Dashboard shows dark table with summary pills
- Projects page shows dark cards with hover border effect
- Project detail shows dark Kanban with 3 columns + Members toggle button
- Task detail shows two-column dark layout with inline editing
