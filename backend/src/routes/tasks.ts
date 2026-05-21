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
