import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export async function listMembers(projectId: string) {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function addMember(projectId: string, email: string, role: Role = Role.MEMBER) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    const err: any = new Error('User is already a member');
    err.statusCode = 400;
    throw err;
  }
  return prisma.projectMember.create({
    data: { projectId, userId: user.id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateMemberRole(projectId: string, userId: string, role: Role) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) {
    const err: any = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
}

export async function removeMember(projectId: string, userId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) {
    const err: any = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}
