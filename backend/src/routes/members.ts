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
