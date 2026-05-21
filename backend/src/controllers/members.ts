import { Request, Response, NextFunction } from 'express';
import * as memberService from '../services/members';
import { Role } from '@prisma/client';

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const members = await memberService.listMembers(req.params.id);
    res.json({ members });
  } catch (err) { next(err); }
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, role } = req.body;
    if (!email) { res.status(400).json({ error: 'email is required' }); return; }
    const member = await memberService.addMember(req.params.id, email, role);
    res.status(201).json({ member });
  } catch (err) { next(err); }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    if (!Object.values(Role).includes(role)) {
      res.status(400).json({ error: 'role must be ADMIN or MEMBER' });
      return;
    }
    const member = await memberService.updateMemberRole(req.params.id, req.params.userId, role);
    res.json({ member });
  } catch (err) { next(err); }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await memberService.removeMember(req.params.id, req.params.userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
