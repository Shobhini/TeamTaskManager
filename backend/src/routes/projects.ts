import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/projects';

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const router = Router();

router.get('/', authMiddleware, ctrl.listProjects);
router.post('/', authMiddleware, validate(createProjectSchema), ctrl.createProject);
router.get('/:id', authMiddleware, requireRole(Role.MEMBER), ctrl.getProject);
router.put('/:id', authMiddleware, requireRole(Role.ADMIN), validate(updateProjectSchema), ctrl.updateProject);
router.delete('/:id', authMiddleware, requireRole(Role.ADMIN), ctrl.deleteProject);

export default router;
