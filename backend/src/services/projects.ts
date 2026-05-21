import prisma from '../lib/prisma';

export async function listProjectsForUser(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    include: { project: true },
  });
  return memberships.map((m) => ({ ...m.project, role: m.role }));
}

export async function createProject(userId: string, name: string, description?: string) {
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
  });
  return project;
}

export async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });
  if (!project) {
    const err: any = new Error('Project not found');
    err.statusCode = 404;
    throw err;
  }
  return project;
}

export async function updateProject(projectId: string, name?: string, description?: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { ...(name && { name }), ...(description !== undefined && { description }) },
  });
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({ where: { id: projectId } });
}
