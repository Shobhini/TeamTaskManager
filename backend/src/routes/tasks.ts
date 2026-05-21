import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/tasks';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  assigneeId: z.string().uuid().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, requireRole(Role.MEMBER), ctrl.listTasks);
router.post('/', authMiddleware, requireRole(Role.ADMIN), validate(createTaskSchema), ctrl.createTask);
router.get('/:taskId', authMiddleware, requireRole(Role.MEMBER), ctrl.getTask);
router.put('/:taskId', authMiddleware, requireRole(Role.MEMBER), validate(updateTaskSchema), ctrl.updateTask);
router.delete('/:taskId', authMiddleware, requireRole(Role.ADMIN), ctrl.deleteTask);

export default router;
