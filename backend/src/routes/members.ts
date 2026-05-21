import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { validate } from '../middleware/validate';
import { Role } from '@prisma/client';
import * as ctrl from '../controllers/members';

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

const router = Router({ mergeParams: true });

router.get('/', authMiddleware, requireRole(Role.MEMBER), ctrl.listMembers);
router.post('/', authMiddleware, requireRole(Role.ADMIN), validate(addMemberSchema), ctrl.addMember);
router.put('/:userId', authMiddleware, requireRole(Role.ADMIN), validate(updateRoleSchema), ctrl.updateMemberRole);
router.delete('/:userId', authMiddleware, requireRole(Role.ADMIN), ctrl.removeMember);

export default router;
