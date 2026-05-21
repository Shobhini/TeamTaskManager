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
