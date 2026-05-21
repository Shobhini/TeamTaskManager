# Team Task Manager — Design Spec
**Date:** 2026-05-21
**Status:** Approved

---

## Overview

A web app where users create projects, invite team members, assign tasks, and track progress. Role-based access (Admin/Member) controls what each user can do within a project. Built as a portfolio project prioritizing clarity and clean architecture over scale.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (bcrypt passwords, 7-day tokens) |
| Monorepo | Single repo, two packages, `concurrently` for dev |

---

## Repository Structure

```
TeamTaskManager/
├── backend/
│   ├── src/
│   │   ├── routes/        # auth, projects, tasks, users
│   │   ├── controllers/   # request handlers
│   │   ├── middleware/    # authMiddleware, roleMiddleware, errorHandler
│   │   ├── services/      # business logic
│   │   └── app.ts         # Express app setup
│   ├── prisma/
│   │   └── schema.prisma  # DB schema + migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # Login, Signup, Dashboard, Projects, ProjectDetail, TaskDetail
│   │   ├── components/    # Navbar, TaskCard, TaskForm, MemberList, StatusBadge
│   │   ├── hooks/         # useAuth, useTasks, useProjects
│   │   ├── api/           # axios client + typed API functions
│   │   └── context/       # AuthContext
│   └── package.json
├── package.json            # root scripts: dev, build
└── .env
```

---

## Data Models (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())

  ownedProjects   Project[]
  projectMembers  ProjectMember[]
  assignedTasks   Task[]          @relation("assignee")
  createdTasks    Task[]          @relation("creator")
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  members     ProjectMember[]
  tasks       Task[]
}

model ProjectMember {
  id        String      @id @default(uuid())
  projectId String
  userId    String
  role      Role        @default(MEMBER)

  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id])

  @@unique([projectId, userId])
}

enum Role {
  ADMIN
  MEMBER
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)

  assigneeId  String?
  assignee    User?      @relation("assignee", fields: [assigneeId], references: [id])

  createdById String
  createdBy   User       @relation("creator", fields: [createdById], references: [id])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

---

## REST API Endpoints

### Auth
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register, returns JWT | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |

### Projects
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/api/projects` | List projects user belongs to | Any member |
| POST | `/api/projects` | Create project (auto-add as ADMIN) | Authenticated |
| GET | `/api/projects/:id` | Project details + members | Any member |
| PUT | `/api/projects/:id` | Update project | ADMIN |
| DELETE | `/api/projects/:id` | Delete project | ADMIN |

### Members
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/api/projects/:id/members` | List members | Any member |
| POST | `/api/projects/:id/members` | Add member by email | ADMIN |
| PUT | `/api/projects/:id/members/:userId` | Change member role | ADMIN |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | ADMIN |

### Tasks
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/api/projects/:id/tasks` | List tasks (filter: status, assignee) | Any member |
| POST | `/api/projects/:id/tasks` | Create task | ADMIN |
| GET | `/api/projects/:id/tasks/:taskId` | Task detail | Any member |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task (ADMIN: all fields; MEMBER: status only) | Any member |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task | ADMIN |

### Dashboard
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard` | All tasks assigned to me, across projects, with overdue flag | Authenticated |

---

## Authentication & RBAC

**Auth flow:**
- Signup: hash password with bcrypt (rounds: 10), create user, return signed JWT
- Login: verify password, return signed JWT
- JWT payload: `{ userId, email }`, expiry: 7 days
- Frontend: store JWT in `localStorage`, send as `Authorization: Bearer <token>`

**Middleware chain:**
1. `authMiddleware` — verifies JWT signature, attaches `req.user = { userId, email }`
2. `roleMiddleware('ADMIN')` — queries `ProjectMember` for `req.user.userId` + `req.params.id`, rejects with 403 if role is not ADMIN

**Role permission matrix:**

| Action | ADMIN | MEMBER |
|---|---|---|
| View project & tasks | ✅ | ✅ |
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| Manage members | ✅ | ❌ |
| Delete project | ✅ | ❌ |

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Email/password form, stores JWT, redirects to dashboard |
| `/signup` | Signup | Name/email/password form |
| `/dashboard` | Dashboard | My tasks across all projects; overdue highlighted; summary counts |
| `/projects` | Projects List | Cards for each project with role badge |
| `/projects/:id` | Project Detail | Member list + Kanban board (TODO / IN_PROGRESS / DONE columns) |
| `/projects/:id/tasks/:taskId` | Task Detail | View/edit task; ADMIN sees all fields, MEMBER sees status only |

**Dashboard layout:**
```
┌─ Summary Bar ──────────────────────────────────┐
│  My Tasks: 12   In Progress: 4   Overdue: 2    │
└────────────────────────────────────────────────┘
┌─ My Tasks Table ───────────────────────────────┐
│  Title | Project | Status | Due Date | Priority │
│  ...                                    [HIGH]  │  ← overdue rows highlighted red
└────────────────────────────────────────────────┘
```

**Auth guard:** `AuthContext` holds JWT + decoded user. `ProtectedRoute` component wraps all authenticated routes and redirects to `/login` if no valid token.

---

## Validation

- Backend: use `zod` for request body validation on all endpoints
- Passwords: minimum 8 characters
- Email: valid format check on signup
- Task dueDate: must be a valid ISO date if provided
- Task assigneeId: must be a userId of an existing member of that project (enforced in service layer)
- All required fields return 400 with field-level error messages

---

## Error Handling

- Centralized Express error handler middleware
- Consistent response shape: `{ error: string, details?: object }`
- HTTP status codes: 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 500 (server error)

---

## Out of Scope (for this version)

- Email notifications
- File attachments
- Comments on tasks
- Real-time updates (WebSockets)
- Multi-tenancy / organization accounts
- Refresh tokens (single JWT, 7-day expiry is acceptable for portfolio)
