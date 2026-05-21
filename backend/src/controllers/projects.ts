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
