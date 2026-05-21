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
