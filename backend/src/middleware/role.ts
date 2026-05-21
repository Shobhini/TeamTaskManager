import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

export function requireRole(requiredRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const projectId = req.params.id;

    if (!userId || !projectId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    try {
      const member = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });

      if (!member) {
        res.status(403).json({ error: 'You are not a member of this project' });
        return;
      }

      if (requiredRole === Role.ADMIN && member.role !== Role.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      req.memberRole = member.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
