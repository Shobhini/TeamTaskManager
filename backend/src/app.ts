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
