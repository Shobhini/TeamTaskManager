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
