# Team Task Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack team task management web app with JWT auth, role-based access, and a React dashboard.

**Architecture:** Monorepo with `backend/` (Express + Prisma + PostgreSQL) and `frontend/` (React + Vite + Tailwind). REST API with JWT auth; role enforcement via middleware querying the `ProjectMember` table. Frontend uses React Router, AuthContext, and axios.

**Tech Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, bcrypt, jsonwebtoken, React, Vite, Tailwind CSS, React Router v6, axios, Vitest (backend), React Testing Library (frontend).

---

## File Map

### Backend
| File | Responsibility |
|---|---|
| `backend/prisma/schema.prisma` | DB schema: User, Project, ProjectMember, Task, enums |
| `backend/src/app.ts` | Express app setup, middleware registration, route mounting |
| `backend/src/server.ts` | Entry point, starts HTTP server |
| `backend/src/lib/prisma.ts` | Prisma client singleton |
| `backend/src/lib/jwt.ts` | `signToken(payload)` and `verifyToken(token)` helpers |
| `backend/src/middleware/auth.ts` | `authMiddleware` — verifies JWT, attaches `req.user` |
| `backend/src/middleware/role.ts` | `requireRole(role)` — checks ProjectMember, returns 403 |
| `backend/src/middleware/error.ts` | Centralized error handler, consistent `{ error, details }` shape |
| `backend/src/middleware/validate.ts` | `validate(schema)` — Zod request body validator middleware |
| `backend/src/routes/auth.ts` | POST /api/auth/signup, POST /api/auth/login |
| `backend/src/routes/projects.ts` | CRUD /api/projects and /api/projects/:id |
| `backend/src/routes/members.ts` | CRUD /api/projects/:id/members |
| `backend/src/routes/tasks.ts` | CRUD /api/projects/:id/tasks |
| `backend/src/routes/dashboard.ts` | GET /api/dashboard |
| `backend/src/controllers/auth.ts` | signup, login handlers |
| `backend/src/controllers/projects.ts` | listProjects, createProject, getProject, updateProject, deleteProject |
| `backend/src/controllers/members.ts` | listMembers, addMember, updateMemberRole, removeMember |
| `backend/src/controllers/tasks.ts` | listTasks, createTask, getTask, updateTask, deleteTask |
| `backend/src/controllers/dashboard.ts` | getDashboard |
| `backend/src/services/auth.ts` | hashPassword, comparePassword, createUser, findUserByEmail |
| `backend/src/services/projects.ts` | project CRUD with ownership checks |
| `backend/src/services/members.ts` | member CRUD with membership checks |
| `backend/src/services/tasks.ts` | task CRUD with assignee membership validation |
| `backend/src/services/dashboard.ts` | fetch assigned tasks with overdue flag |
| `backend/src/types/express.d.ts` | Extend Express `Request` with `user: { userId: string; email: string }` |
| `backend/tests/auth.test.ts` | Auth endpoint tests |
| `backend/tests/projects.test.ts` | Projects endpoint tests |
| `backend/tests/tasks.test.ts` | Tasks + members endpoint tests |

### Frontend
| File | Responsibility |
|---|---|
| `frontend/src/main.tsx` | React entry, wraps app in Router + AuthProvider |
| `frontend/src/App.tsx` | Route definitions, ProtectedRoute wrapper |
| `frontend/src/context/AuthContext.tsx` | JWT storage, user state, login/logout helpers |
| `frontend/src/api/client.ts` | Axios instance with base URL + auth header interceptor |
| `frontend/src/api/auth.ts` | `signup(data)`, `login(data)` API calls |
| `frontend/src/api/projects.ts` | `listProjects()`, `createProject()`, `getProject()`, `updateProject()`, `deleteProject()` |
| `frontend/src/api/members.ts` | `listMembers()`, `addMember()`, `updateMemberRole()`, `removeMember()` |
| `frontend/src/api/tasks.ts` | `listTasks()`, `createTask()`, `getTask()`, `updateTask()`, `deleteTask()` |
| `frontend/src/api/dashboard.ts` | `getDashboard()` |
| `frontend/src/pages/Login.tsx` | Login form |
| `frontend/src/pages/Signup.tsx` | Signup form |
| `frontend/src/pages/Dashboard.tsx` | Summary bar + tasks table with overdue highlighting |
| `frontend/src/pages/Projects.tsx` | Project cards list + create project modal |
| `frontend/src/pages/ProjectDetail.tsx` | Kanban board + member sidebar |
| `frontend/src/pages/TaskDetail.tsx` | Task view/edit (ADMIN: all fields; MEMBER: status only) |
| `frontend/src/components/Navbar.tsx` | Top nav with user name + logout |
| `frontend/src/components/TaskCard.tsx` | Kanban card showing title, priority, assignee, due date |
| `frontend/src/components/TaskForm.tsx` | Create/edit task form (controlled) |
| `frontend/src/components/MemberList.tsx` | List members with role badge + add/remove for ADMIN |
| `frontend/src/components/StatusBadge.tsx` | Colored badge for TODO/IN_PROGRESS/DONE |
| `frontend/src/components/ProtectedRoute.tsx` | Redirects to /login if no token |

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `frontend/` (via Vite)
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Init root package.json**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
npm init -y
```

- [ ] **Step 2: Update root package.json with workspace scripts**

Replace the contents of `package.json` with:

```json
{
  "name": "team-task-manager",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "build": "npm run build --prefix backend && npm run build --prefix frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 3: Install root devDependencies**

```bash
npm install
```

Expected: `node_modules/` created at root with `concurrently`.

- [ ] **Step 4: Scaffold backend**

```bash
mkdir -p backend/src/{routes,controllers,middleware,services,lib}
mkdir -p backend/prisma
mkdir -p backend/tests
cd backend
npm init -y
```

- [ ] **Step 5: Install backend dependencies**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm install express prisma @prisma/client bcryptjs jsonwebtoken zod cors dotenv
npm install -D typescript ts-node @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/cors vitest supertest @types/supertest tsx
```

Expected: `node_modules/` in `backend/`, no errors.

- [ ] **Step 6: Create backend tsconfig.json**

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 7: Update backend package.json scripts**

Edit `backend/package.json` — replace the `"scripts"` section with:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "vitest run",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate"
}
```

- [ ] **Step 8: Scaffold frontend with Vite**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 9: Configure Tailwind**

Edit `frontend/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `frontend/src/index.css` — replace entire contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Create .env.example and .gitignore**

Create `.env.example` at root:

```
DATABASE_URL="postgresql://user:password@localhost:5432/teamtaskmanager"
JWT_SECRET="change-this-secret-min-32-chars"
PORT=4000
```

Create `.gitignore` at root:

```
node_modules/
dist/
.env
*.env.local
```

- [ ] **Step 11: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git init
git add .
git commit -m "chore: scaffold monorepo with backend and frontend"
```

---

## Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/lib/prisma.ts`

- [ ] **Step 1: Create .env in backend**

Create `backend/.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/teamtaskmanager"
JWT_SECRET="supersecretkey-change-in-production-32chars"
PORT=4000
```

- [ ] **Step 2: Initialize Prisma**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` created.

- [ ] **Step 3: Write the schema**

Replace entire contents of `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())

  ownedProjects  Project[]
  projectMembers ProjectMember[]
  assignedTasks  Task[]          @relation("assignee")
  createdTasks   Task[]          @relation("creator")
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  members ProjectMember[]
  tasks   Task[]
}

model ProjectMember {
  id        String @id @default(uuid())
  projectId String
  userId    String
  role      Role   @default(MEMBER)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

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

  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  assigneeId String?
  assignee   User?   @relation("assignee", fields: [assigneeId], references: [id])

  createdById String
  createdBy   User   @relation("creator", fields: [createdById], references: [id])
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

- [ ] **Step 4: Create the database and run migration**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npx prisma migrate dev --name init
```

Expected: Migration created in `prisma/migrations/`, tables created in PostgreSQL.

- [ ] **Step 5: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `@prisma/client` generated, no errors.

- [ ] **Step 6: Create Prisma singleton**

Create `backend/src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

- [ ] **Step 7: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/prisma backend/src/lib/prisma.ts backend/.env
git commit -m "feat: add Prisma schema and database migration"
```

---

## Task 3: Express App Skeleton + Middleware

**Files:**
- Create: `backend/src/types/express.d.ts`
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/middleware/role.ts`
- Create: `backend/src/middleware/error.ts`
- Create: `backend/src/middleware/validate.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`

- [ ] **Step 1: Extend Express Request type**

Create `backend/src/types/express.d.ts`:

```typescript
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      memberRole?: Role;
    }
  }
}
```

- [ ] **Step 2: Create JWT helpers**

Create `backend/src/lib/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!;

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
```

- [ ] **Step 3: Create auth middleware**

Create `backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

- [ ] **Step 4: Create role middleware**

Create `backend/src/middleware/role.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

export function requireRole(requiredRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const projectId = req.params.id;

    if (!userId || !projectId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      res.status(403).json({ error: 'You are not a member of this project' });
      return;
    }

    if (requiredRole === Role.ADMIN && member.role !== Role.ADMIN) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.memberRole = member.role;
    next();
  };
}
```

- [ ] **Step 5: Create error handler middleware**

Create `backend/src/middleware/error.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
  });
}
```

- [ ] **Step 6: Create Zod validation middleware**

Create `backend/src/middleware/validate.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

- [ ] **Step 7: Create Express app**

Create `backend/src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes will be mounted here in later tasks
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;
```

- [ ] **Step 8: Create server entry point**

Create `backend/src/server.ts`:

```typescript
import app from './app';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 9: Verify server starts**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm run dev
```

Expected: `Server running on http://localhost:4000` in terminal. Ctrl+C to stop.

- [ ] **Step 10: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/src
git commit -m "feat: add Express app skeleton with auth/role/error middleware"
```

---

## Task 4: Auth Endpoints (Signup & Login)

**Files:**
- Create: `backend/src/services/auth.ts`
- Create: `backend/src/controllers/auth.ts`
- Create: `backend/src/routes/auth.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/auth.test.ts`

- [ ] **Step 1: Write failing auth tests**

Create `backend/tests/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

beforeAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 400 for duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Alice2',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 for short password', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test -- tests/auth.test.ts
```

Expected: All tests FAIL — routes not defined yet.

- [ ] **Step 3: Create auth service**

Create `backend/src/services/auth.ts`:

```typescript
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export async function createUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err: any = new Error('Email already in use');
    err.statusCode = 400;
    throw err;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}
```

- [ ] **Step 4: Create auth controller**

Create `backend/src/controllers/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUser, verifyCredentials } from '../services/auth';
import { signToken } from '../lib/jwt';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const user = await createUser(name, email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(200).json({ token, user });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
}
```

- [ ] **Step 5: Create auth routes**

Create `backend/src/routes/auth.ts`:

```typescript
import { Router } from 'express';
import { signup, login } from '../controllers/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

export default router;
```

- [ ] **Step 6: Mount auth routes in app.ts**

Edit `backend/src/app.ts` — add the import and mount after the health route:

```typescript
import authRouter from './routes/auth';
// ...after app.use(express.json()):
app.use('/api/auth', authRouter);
```

Full updated `backend/src/app.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
```

- [ ] **Step 7: Run tests — expect pass**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test -- tests/auth.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/src/services/auth.ts backend/src/controllers/auth.ts backend/src/routes/auth.ts backend/src/app.ts backend/tests/auth.test.ts
git commit -m "feat: add signup and login endpoints with JWT"
```

---

## Task 5: Projects Endpoints

**Files:**
- Create: `backend/src/services/projects.ts`
- Create: `backend/src/controllers/projects.ts`
- Create: `backend/src/routes/projects.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/projects.test.ts`

- [ ] **Step 1: Write failing project tests**

Create `backend/tests/projects.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

let token: string;
let projectId: string;

beforeAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const res = await request(app).post('/api/auth/signup').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/projects', () => {
  it('creates a project and auto-adds creator as ADMIN', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project', description: 'A test project' });
    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('Test Project');
    projectId = res.body.project.id;

    const member = await prisma.projectMember.findFirst({
      where: { projectId },
    });
    expect(member?.role).toBe('ADMIN');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/projects', () => {
  it('lists projects the user belongs to', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns project details', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(projectId);
    expect(res.body.project.members).toBeDefined();
  });
});

describe('PUT /api/projects/:id', () => {
  it('updates project name as ADMIN', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Project' });
    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Updated Project');
  });
});

describe('DELETE /api/projects/:id', () => {
  it('deletes the project as ADMIN', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 2: Run tests — expect failures**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test -- tests/projects.test.ts
```

Expected: All tests FAIL — routes not defined yet.

- [ ] **Step 3: Create projects service**

Create `backend/src/services/projects.ts`:

```typescript
import prisma from '../lib/prisma';

export async function listProjectsForUser(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: { project: true },
  });
  return memberships.map((m) => ({ ...m.project, role: m.role }));
}

export async function createProject(userId: string, name: string, description?: string) {
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
  });
  return project;
}

export async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
  if (!project) {
    const err: any = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  return project;
}

export async function updateProject(projectId: string, name?: string, description?: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { ...(name && { name }), ...(description !== undefined && { description }) },
  });
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({ where: { id: projectId } });
}
```

- [ ] **Step 4: Create projects controller**

Create `backend/src/controllers/projects.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projects';

export async function listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await projectService.listProjectsForUser(req.user!.userId);
    res.json({ projects });
  } catch (err) { next(err); }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    if (!name) { res.status(400).json({ error: 'name is required' }); return; }
    const project = await projectService.createProject(req.user!.userId, name, description);
    res.status(201).json({ project });
  } catch (err) { next(err); }
}

export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ project });
  } catch (err) { next(err); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    const project = await projectService.updateProject(req.params.id, name, description);
    res.json({ project });
  } catch (err) { next(err); }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
```

- [ ] **Step 5: Create projects routes**

Create `backend/src/routes/projects.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/projects';

const router = Router();

router.get('/', authMiddleware, ctrl.listProjects);
router.post('/', authMiddleware, ctrl.createProject);
router.get('/:id', authMiddleware, requireRole(Role.MEMBER), ctrl.getProject);
router.put('/:id', authMiddleware, requireRole(Role.ADMIN), ctrl.updateProject);
router.delete('/:id', authMiddleware, requireRole(Role.ADMIN), ctrl.deleteProject);

export default router;
```

- [ ] **Step 6: Mount projects routes in app.ts**

Edit `backend/src/app.ts` — add import and mount:

```typescript
import projectsRouter from './routes/projects';
// after auth route:
app.use('/api/projects', projectsRouter);
```

- [ ] **Step 7: Run tests — expect pass**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test -- tests/projects.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/src/services/projects.ts backend/src/controllers/projects.ts backend/src/routes/projects.ts backend/src/app.ts backend/tests/projects.test.ts
git commit -m "feat: add projects CRUD endpoints with RBAC"
```

---

## Task 6: Members & Tasks Endpoints

**Files:**
- Create: `backend/src/services/members.ts`
- Create: `backend/src/controllers/members.ts`
- Create: `backend/src/routes/members.ts`
- Create: `backend/src/services/tasks.ts`
- Create: `backend/src/controllers/tasks.ts`
- Create: `backend/src/routes/tasks.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/tasks.test.ts`

- [ ] **Step 1: Create members service**

Create `backend/src/services/members.ts`:

```typescript
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export async function listMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function addMember(projectId: string, email: string, role: Role = Role.MEMBER) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    const err: any = new Error('User is already a member');
    err.statusCode = 400;
    throw err;
  }
  return prisma.projectMember.create({
    data: { projectId, userId: user.id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateMemberRole(projectId: string, userId: string, role: Role) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) {
    const err: any = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
}

export async function removeMember(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) {
    const err: any = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}
```

- [ ] **Step 2: Create members controller**

Create `backend/src/controllers/members.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import * as memberService from '../services/members';
import { Role } from '@prisma/client';

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const members = await memberService.listMembers(req.params.id);
    res.json({ members });
  } catch (err) { next(err); }
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, role } = req.body;
    if (!email) { res.status(400).json({ error: 'email is required' }); return; }
    const member = await memberService.addMember(req.params.id, email, role);
    res.status(201).json({ member });
  } catch (err) { next(err); }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      res.status(400).json({ error: 'role must be ADMIN or MEMBER' });
      return;
    }
    const member = await memberService.updateMemberRole(req.params.id, req.params.userId, role);
    res.json({ member });
  } catch (err) { next(err); }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await memberService.removeMember(req.params.id, req.params.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
```

- [ ] **Step 3: Create members routes**

Create `backend/src/routes/members.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/members';

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, requireRole(Role.MEMBER), ctrl.listMembers);
router.post('/', authMiddleware, requireRole(Role.ADMIN), ctrl.addMember);
router.put('/:userId', authMiddleware, requireRole(Role.ADMIN), ctrl.updateMemberRole);
router.delete('/:userId', authMiddleware, requireRole(Role.ADMIN), ctrl.removeMember);

export default router;
```

- [ ] **Step 4: Create tasks service**

Create `backend/src/services/tasks.ts`:

```typescript
import prisma from '../lib/prisma';
import { TaskStatus, Priority } from '@prisma/client';

export async function listTasks(projectId: string, filters: { status?: TaskStatus; assigneeId?: string }) {
  return prisma.task.findMany({
    where: {
      projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTask(
  projectId: string,
  createdById: string,
  data: { title: string; description?: string; priority?: Priority; dueDate?: string; assigneeId?: string }
) {
  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    if (!isMember) {
      const err: any = new Error('Assignee must be a project member');
      err.statusCode = 400;
      throw err;
    }
  }
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? Priority.MEDIUM,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assigneeId: data.assigneeId,
      projectId,
      createdById,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });
}

export async function getTaskById(taskId: string, projectId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });
  if (!task) {
    const err: any = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  return task;
}

export async function updateTask(
  taskId: string,
  projectId: string,
  isAdmin: boolean,
  data: { title?: string; description?: string; status?: TaskStatus; priority?: Priority; dueDate?: string; assigneeId?: string }
) {
  const task = await getTaskById(taskId, projectId);

  if (!isAdmin) {
    // Members can only update status
    if (Object.keys(data).some((k) => k !== 'status')) {
      const err: any = new Error('Members can only update task status');
      err.statusCode = 403;
      throw err;
    }
  }

  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    if (!isMember) {
      const err: any = new Error('Assignee must be a project member');
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.task.update({
    where: { id: task.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });
}

export async function deleteTask(taskId: string, projectId: string) {
  const task = await getTaskById(taskId, projectId);
  await prisma.task.delete({ where: { id: task.id } });
}
```

- [ ] **Step 5: Create tasks controller**

Create `backend/src/controllers/tasks.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/tasks';
import { Role, TaskStatus } from '@prisma/client';

export async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, assigneeId } = req.query as { status?: TaskStatus; assigneeId?: string };
    const tasks = await taskService.listTasks(req.params.id, { status, assigneeId });
    res.json({ tasks });
  } catch (err) { next(err); }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.createTask(req.params.id, req.user!.userId, req.body);
    res.status(201).json({ task });
  } catch (err) { next(err); }
}

export async function getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await taskService.getTaskById(req.params.taskId, req.params.id);
    res.json({ task });
  } catch (err) { next(err); }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = req.memberRole === Role.ADMIN;
    const task = await taskService.updateTask(req.params.taskId, req.params.id, isAdmin, req.body);
    res.json({ task });
  } catch (err) { next(err); }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.deleteTask(req.params.taskId, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
```

- [ ] **Step 6: Create tasks routes**

Create `backend/src/routes/tasks.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/tasks';

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, requireRole(Role.MEMBER), ctrl.listTasks);
router.post('/', authMiddleware, requireRole(Role.ADMIN), ctrl.createTask);
router.get('/:taskId', authMiddleware, requireRole(Role.MEMBER), ctrl.getTask);
router.put('/:taskId', authMiddleware, requireRole(Role.MEMBER), ctrl.updateTask);
router.delete('/:taskId', authMiddleware, requireRole(Role.ADMIN), ctrl.deleteTask);

export default router;
```

- [ ] **Step 7: Mount members and tasks routes in app.ts**

Replace `backend/src/app.ts` with:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import membersRouter from './routes/members';
import tasksRouter from './routes/tasks';
import dashboardRouter from './routes/dashboard';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/projects/:id/members', membersRouter);
app.use('/api/projects/:id/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(errorHandler);

export default app;
```

Note: `dashboardRouter` is created in the next step — create a stub now.

- [ ] **Step 8: Create dashboard stub route**

Create `backend/src/routes/dashboard.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({ tasks: [] });
});

export default router;
```

- [ ] **Step 9: Write tasks tests**

Create `backend/tests/tasks.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

let adminToken: string;
let memberToken: string;
let projectId: string;
let taskId: string;
let memberId: string;

beforeAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const admin = await request(app).post('/api/auth/signup').send({
    name: 'Admin', email: 'admin2@test.com', password: 'password123',
  });
  adminToken = admin.body.token;

  const member = await request(app).post('/api/auth/signup').send({
    name: 'Member', email: 'member@test.com', password: 'password123',
  });
  memberToken = member.body.token;
  memberId = member.body.user.id;

  const proj = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Task Project' });
  projectId = proj.body.project.id;

  await request(app)
    .post(`/api/projects/${projectId}/members`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: 'member@test.com', role: 'MEMBER' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/projects/:id/tasks', () => {
  it('ADMIN can create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Fix bug', priority: 'HIGH' });
    expect(res.status).toBe(201);
    taskId = res.body.task.id;
  });

  it('MEMBER cannot create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Another task' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/projects/:id/tasks', () => {
  it('MEMBER can list tasks', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/projects/:id/tasks/:taskId', () => {
  it('MEMBER can update task status', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('IN_PROGRESS');
  });

  it('MEMBER cannot update task title', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(403);
  });

  it('ADMIN can update any task field', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated title', assigneeId: memberId });
    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated title');
  });
});

describe('DELETE /api/projects/:id/tasks/:taskId', () => {
  it('ADMIN can delete a task', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
```

- [ ] **Step 10: Run all tests**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test
```

Expected: All tests PASS across auth, projects, and tasks test files.

- [ ] **Step 11: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/src backend/tests/tasks.test.ts
git commit -m "feat: add members, tasks endpoints with role-based access"
```

---

## Task 7: Dashboard Endpoint

**Files:**
- Create: `backend/src/services/dashboard.ts`
- Create: `backend/src/controllers/dashboard.ts`
- Modify: `backend/src/routes/dashboard.ts`

- [ ] **Step 1: Create dashboard service**

Create `backend/src/services/dashboard.ts`:

```typescript
import prisma from '../lib/prisma';

export async function getMyTasks(userId: string) {
  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return tasks.map((task) => ({
    ...task,
    overdue: task.dueDate !== null && task.dueDate < now && task.status !== 'DONE',
  }));
}
```

- [ ] **Step 2: Create dashboard controller**

Create `backend/src/controllers/dashboard.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { getMyTasks } from '../services/dashboard';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await getMyTasks(req.user!.userId);
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter((t) => t.overdue).length;
    res.json({ summary: { total, inProgress, overdue }, tasks });
  } catch (err) { next(err); }
}
```

- [ ] **Step 3: Update dashboard route**

Replace `backend/src/routes/dashboard.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboard';

const router = Router();

router.get('/', authMiddleware, getDashboard);

export default router;
```

- [ ] **Step 4: Run all tests**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add backend/src/services/dashboard.ts backend/src/controllers/dashboard.ts backend/src/routes/dashboard.ts
git commit -m "feat: add dashboard endpoint with overdue task flag"
```

---

## Task 8: Frontend — Auth Context, API Client, Routing

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/projects.ts`
- Create: `frontend/src/api/members.ts`
- Create: `frontend/src/api/tasks.ts`
- Create: `frontend/src/api/dashboard.ts`
- Create: `frontend/src/components/ProtectedRoute.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create axios client**

Create `frontend/src/api/client.ts`:

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:4000/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
```

- [ ] **Step 2: Create API modules**

Create `frontend/src/api/auth.ts`:

```typescript
import client from './client';

export const signup = (data: { name: string; email: string; password: string }) =>
  client.post('/auth/signup', data);

export const login = (data: { email: string; password: string }) =>
  client.post('/auth/login', data);
```

Create `frontend/src/api/projects.ts`:

```typescript
import client from './client';

export const listProjects = () => client.get('/projects');
export const createProject = (data: { name: string; description?: string }) => client.post('/projects', data);
export const getProject = (id: string) => client.get(`/projects/${id}`);
export const updateProject = (id: string, data: { name?: string; description?: string }) => client.put(`/projects/${id}`, data);
export const deleteProject = (id: string) => client.delete(`/projects/${id}`);
```

Create `frontend/src/api/members.ts`:

```typescript
import client from './client';

export const listMembers = (projectId: string) => client.get(`/projects/${projectId}/members`);
export const addMember = (projectId: string, data: { email: string; role?: string }) => client.post(`/projects/${projectId}/members`, data);
export const updateMemberRole = (projectId: string, userId: string, role: string) => client.put(`/projects/${projectId}/members/${userId}`, { role });
export const removeMember = (projectId: string, userId: string) => client.delete(`/projects/${projectId}/members/${userId}`);
```

Create `frontend/src/api/tasks.ts`:

```typescript
import client from './client';

export const listTasks = (projectId: string, params?: { status?: string; assigneeId?: string }) =>
  client.get(`/projects/${projectId}/tasks`, { params });
export const createTask = (projectId: string, data: object) => client.post(`/projects/${projectId}/tasks`, data);
export const getTask = (projectId: string, taskId: string) => client.get(`/projects/${projectId}/tasks/${taskId}`);
export const updateTask = (projectId: string, taskId: string, data: object) => client.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const deleteTask = (projectId: string, taskId: string) => client.delete(`/projects/${projectId}/tasks/${taskId}`);
```

Create `frontend/src/api/dashboard.ts`:

```typescript
import client from './client';

export const getDashboard = () => client.get('/dashboard');
```

- [ ] **Step 3: Create AuthContext**

Create `frontend/src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem('token');
  const [token, setToken] = useState<string | null>(stored);
  const [user, setUser] = useState<User | null>(stored ? jwtDecode<User>(stored) : null);

  function login(newToken: string) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(jwtDecode<User>(newToken));
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 4: Install jwt-decode**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm install jwt-decode
```

- [ ] **Step 5: Create ProtectedRoute**

Create `frontend/src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 6: Update main.tsx**

Replace `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

- [ ] **Step 7: Update App.tsx with routes**

Replace `frontend/src/App.tsx`:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
      <Route path="/projects/:id/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 8: Create placeholder page stubs so the app compiles**

Create `frontend/src/pages/Login.tsx`:

```typescript
export default function Login() { return <div>Login</div>; }
```

Create `frontend/src/pages/Signup.tsx`:

```typescript
export default function Signup() { return <div>Signup</div>; }
```

Create `frontend/src/pages/Dashboard.tsx`:

```typescript
export default function Dashboard() { return <div>Dashboard</div>; }
```

Create `frontend/src/pages/Projects.tsx`:

```typescript
export default function Projects() { return <div>Projects</div>; }
```

Create `frontend/src/pages/ProjectDetail.tsx`:

```typescript
export default function ProjectDetail() { return <div>Project Detail</div>; }
```

Create `frontend/src/pages/TaskDetail.tsx`:

```typescript
export default function TaskDetail() { return <div>Task Detail</div>; }
```

- [ ] **Step 9: Verify frontend compiles**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run dev
```

Expected: Vite dev server starts, no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src
git commit -m "feat: add frontend routing, AuthContext, and API client"
```

---

## Task 9: Frontend — Navbar + Login/Signup Pages

**Files:**
- Create: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Signup.tsx`

- [ ] **Step 1: Create Navbar**

Replace `frontend/src/components/Navbar.tsx`:

```typescript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex gap-6">
        <Link to="/dashboard" className="font-semibold hover:underline">Dashboard</Link>
        <Link to="/projects" className="hover:underline">Projects</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.email}</span>
        <button onClick={handleLogout} className="text-sm bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50">
          Logout
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Build Login page**

Replace `frontend/src/pages/Login.tsx`:

```typescript
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.error ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">Sign In</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          No account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build Signup page**

Replace `frontend/src/pages/Signup.tsx`:

```typescript
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.error ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">Create Account</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              required className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-500">
          Have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify no TypeScript errors**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components/Navbar.tsx frontend/src/pages/Login.tsx frontend/src/pages/Signup.tsx
git commit -m "feat: add login, signup pages and navbar"
```

---

## Task 10: Frontend — Dashboard Page

**Files:**
- Create: `frontend/src/components/StatusBadge.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Create StatusBadge component**

Create `frontend/src/components/StatusBadge.tsx`:

```typescript
const colors: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
```

- [ ] **Step 2: Build Dashboard page**

Replace `frontend/src/pages/Dashboard.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>

        {/* Summary Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'My Tasks', value: summary.total, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'In Progress', value: summary.inProgress, color: 'bg-blue-50 text-blue-700' },
            { label: 'Overdue', value: summary.overdue, color: 'bg-red-50 text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-lg p-4 ${color}`}>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tasks Table */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned to you.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  {['Title', 'Project', 'Status', 'Priority', 'Due Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={`border-t ${task.overdue ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/projects/${task.project.id}/tasks/${task.id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link to={`/projects/${task.project.id}`} className="hover:underline">
                        {task.project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${task.priority === 'HIGH' ? 'text-red-600' : task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      {task.overdue && <span className="ml-2 text-red-500 text-xs font-semibold">OVERDUE</span>}
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

- [ ] **Step 3: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components/StatusBadge.tsx frontend/src/pages/Dashboard.tsx
git commit -m "feat: add dashboard page with summary bar and overdue highlighting"
```

---

## Task 11: Frontend — Projects List Page

**Files:**
- Modify: `frontend/src/pages/Projects.tsx`

- [ ] **Step 1: Build Projects page**

Replace `frontend/src/pages/Projects.tsx`:

```typescript
import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
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

  useEffect(() => {
    projectsApi.listProjects().then((res) => setProjects(res.data.projects));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await projectsApi.createProject({ name, description });
      setProjects((prev) => [...prev, { ...res.data.project, role: 'ADMIN' }]);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create project');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-gray-800">{project.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${project.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {project.role}
                  </span>
                </div>
                {project.description && <p className="text-sm text-gray-500 mt-2">{project.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">New Project</h2>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  value={name} onChange={(e) => setName(e.target.value)} required
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <input
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  Create
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
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
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/Projects.tsx
git commit -m "feat: add projects list page with create modal"
```

---

## Task 12: Frontend — Project Detail (Kanban + Members)

**Files:**
- Create: `frontend/src/components/TaskCard.tsx`
- Create: `frontend/src/components/TaskForm.tsx`
- Create: `frontend/src/components/MemberList.tsx`
- Modify: `frontend/src/pages/ProjectDetail.tsx`

- [ ] **Step 1: Create TaskCard component**

Create `frontend/src/components/TaskCard.tsx`:

```typescript
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
}

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Link
      to={`/projects/${projectId}/tasks/${task.id}`}
      className={`block bg-white border rounded-lg p-3 shadow-sm hover:shadow transition-shadow ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}
    >
      <p className="font-medium text-gray-800 text-sm">{task.title}</p>
      <div className="flex items-center gap-2 mt-2">
        <StatusBadge status={task.status} />
        <span className={`text-xs ${task.priority === 'HIGH' ? 'text-red-500' : task.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-gray-400'}`}>
          {task.priority}
        </span>
      </div>
      {task.assignee && (
        <p className="text-xs text-gray-500 mt-1">Assigned: {task.assignee.name}</p>
      )}
      {task.dueDate && (
        <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Create TaskForm component**

Create `frontend/src/components/TaskForm.tsx`:

```typescript
import { useState, FormEvent } from 'react';

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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Assign To</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm disabled:opacity-50">
          {loading ? 'Saving...' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create MemberList component**

Create `frontend/src/components/MemberList.tsx`:

```typescript
import { useState } from 'react';
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

  async function handleAdd() {
    setError('');
    try {
      const res = await membersApi.addMember(projectId, { email, role: 'MEMBER' });
      onMembersChange([...members, res.data.member]);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to add member');
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
      <h3 className="font-semibold text-gray-700 mb-3">Members</h3>
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <ul className="space-y-2 mb-4">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-800">{m.user.name}</p>
              <p className="text-gray-500 text-xs">{m.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {m.role}
              </span>
              {isAdmin && (
                <button onClick={() => handleRemove(m.userId)}
                  className="text-red-500 hover:text-red-700 text-xs">Remove</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <div className="flex gap-2">
          <input
            placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button onClick={handleAdd}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700">
            Add
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build ProjectDetail page**

Replace `frontend/src/pages/ProjectDetail.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import MemberList from '../components/MemberList';
import { useAuth } from '../context/AuthContext';
import * as projectsApi from '../api/projects';
import * as tasksApi from '../api/tasks';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

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
  const [loading, setLoading] = useState(true);

  const myMembership = project?.members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectsApi.getProject(id),
      tasksApi.listTasks(id),
    ]).then(([projRes, tasksRes]) => {
      setProject(projRes.data.project);
      setTasks(tasksRes.data.tasks);
    }).finally(() => setLoading(false));
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

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Loading...</p></div>;
  if (!project) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Project not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
            >
              + New Task
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Kanban Board */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {COLUMNS.map((col) => (
              <div key={col} className="bg-gray-100 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">{col.replace('_', ' ')}</h3>
                <div className="space-y-2">
                  {tasks.filter((t) => t.status === col).map((task) => (
                    <TaskCard key={task.id} task={task} projectId={project.id} />
                  ))}
                  {tasks.filter((t) => t.status === col).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Member Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow p-4 h-fit">
            <MemberList
              members={project.members}
              projectId={project.id}
              isAdmin={isAdmin ?? false}
              onMembersChange={(updated) => setProject((p) => p ? { ...p, members: updated } : p)}
            />
          </div>
        </div>

        {/* Create Task Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-bold mb-4">New Task</h2>
              <TaskForm
                members={project.members}
                onSubmit={handleCreateTask}
                onCancel={() => setShowTaskForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/components frontend/src/pages/ProjectDetail.tsx
git commit -m "feat: add project detail page with Kanban board and member management"
```

---

## Task 13: Frontend — Task Detail Page

**Files:**
- Modify: `frontend/src/pages/TaskDetail.tsx`

- [ ] **Step 1: Build TaskDetail page**

Replace `frontend/src/pages/TaskDetail.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];

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

export default function TaskDetail() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const myMembership = members.find((m) => m.userId === user?.userId);
  const isAdmin = myMembership?.role === 'ADMIN';

  useEffect(() => {
    if (!id || !taskId) return;
    Promise.all([
      tasksApi.getTask(id, taskId),
      projectsApi.getProject(id),
    ]).then(([taskRes, projRes]) => {
      const t = taskRes.data.task;
      setTask(t);
      setMembers(projRes.data.project.members);
      setTitle(t.title);
      setDescription(t.description ?? '');
      setStatus(t.status);
      setPriority(t.priority);
      setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
      setAssigneeId(t.assignee?.id ?? '');
    }).finally(() => setLoading(false));
  }, [id, taskId]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const payload = isAdmin
        ? { title, description, status, priority, dueDate: dueDate || undefined, assigneeId: assigneeId || undefined }
        : { status };
      const res = await tasksApi.updateTask(id!, taskId!, payload);
      setTask(res.data.task);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.deleteTask(id!, taskId!);
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete');
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Loading...</p></div>;
  if (!task) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="p-8 text-gray-500">Task not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate(`/projects/${id}`)} className="text-sm text-indigo-600 hover:underline mb-4 block">
          ← Back to project
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {editing ? (
            <div className="space-y-4">
              {isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                        <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}
                      className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)}
                    className="text-sm text-indigo-600 hover:underline">Edit</button>
                  {isAdmin && (
                    <button onClick={handleDelete}
                      className="text-sm text-red-500 hover:underline">Delete</button>
                  )}
                </div>
              </div>
              {task.description && <p className="text-gray-600 text-sm mb-4">{task.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Status: </span><StatusBadge status={task.status} /></div>
                <div><span className="text-gray-500">Priority: </span><span className="font-medium">{task.priority}</span></div>
                <div><span className="text-gray-500">Assigned to: </span><span>{task.assignee?.name ?? 'Unassigned'}</span></div>
                <div><span className="text-gray-500">Due: </span><span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</span></div>
                <div><span className="text-gray-500">Created by: </span><span>{task.createdBy?.name}</span></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update task query in getTaskById to include createdBy**

Edit `backend/src/services/tasks.ts` — update the `getTaskById` include block:

```typescript
export async function getTaskById(taskId: string, projectId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!task) {
    const err: any = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  return task;
}
```

Also update `createTask` return include and `updateTask` return include to match:

```typescript
// In createTask, change the return include to:
include: {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
},

// In updateTask, change the return include to:
include: {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
},
```

- [ ] **Step 3: Build check**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Run all backend tests**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add frontend/src/pages/TaskDetail.tsx backend/src/services/tasks.ts
git commit -m "feat: add task detail page with role-aware edit form"
```

---

## Task 14: End-to-End Smoke Test & Final Wiring

**Files:**
- No new files — manual integration verification

- [ ] **Step 1: Start backend**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm run dev
```

Expected: `Server running on http://localhost:4000`

- [ ] **Step 2: Start frontend (new terminal)**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/frontend
npm run dev
```

Expected: Vite server at `http://localhost:5173`

- [ ] **Step 3: Smoke test checklist**

Open `http://localhost:5173` in a browser and verify:

- [ ] Redirect to `/login` when not authenticated
- [ ] Signup creates an account and redirects to `/dashboard`
- [ ] Dashboard shows empty state with summary counts
- [ ] Create a project on `/projects` — appears as a card with ADMIN badge
- [ ] Navigate to project detail — Kanban board loads, member sidebar shows current user
- [ ] Create a task as ADMIN — appears in TODO column
- [ ] Click task card — TaskDetail page loads with all fields
- [ ] Edit task as ADMIN — all fields editable
- [ ] Signup a second account in a new incognito window
- [ ] On first account: add second user as MEMBER via member sidebar
- [ ] Login as MEMBER — can see project and tasks
- [ ] As MEMBER on task detail: only status field is editable
- [ ] Assign task to member — appears on member's dashboard with overdue if past due

- [ ] **Step 4: Run all backend tests one final time**

```bash
cd /Users/shobs/Downloads/TeamTaskManager/backend
npm test
```

Expected: All tests PASS.

- [ ] **Step 5: Final commit**

```bash
cd /Users/shobs/Downloads/TeamTaskManager
git add .
git commit -m "chore: complete team task manager implementation"
```
