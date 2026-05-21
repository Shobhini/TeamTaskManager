import prisma from '../lib/prisma';
import { TaskStatus, Priority } from '@prisma/client';

export async function listTasks(projectId: string, filters: { status?: TaskStatus; assigneeId?: string }) {
  return prisma.task.findMany({
    where: {
      projectId,
      ...(filters.status && { status: filters.status }),
      ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTask(
  projectId: string,
  createdById: string,
  data: { title: string; description?: string; priority?: Priority; dueDate?: string; assigneeId?: string }
) {
  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    if (!isMember) {
      const err: any = new Error('Assignee must be a project member');
      err.statusCode = 400;
      throw err;
    }
  }
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority ?? Priority.MEDIUM,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assigneeId: data.assigneeId,
      projectId,
      createdById,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function getTaskById(taskId: string, projectId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!task) {
    const err: any = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }
  return task;
}

export async function updateTask(
  taskId: string,
  projectId: string,
  isAdmin: boolean,
  data: { title?: string; description?: string; status?: TaskStatus; priority?: Priority; dueDate?: string; assigneeId?: string }
) {
  const task = await getTaskById(taskId, projectId);

  if (!isAdmin) {
    const nonStatusKeys = Object.keys(data).filter((k) => k !== 'status');
    if (nonStatusKeys.length > 0) {
      const err: any = new Error('Members can only update task status');
      err.statusCode = 403;
      throw err;
    }
  }

  if (data.assigneeId) {
    const isMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.assigneeId } },
    });
    if (!isMember) {
      const err: any = new Error('Assignee must be a project member');
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.task.update({
    where: { id: task.id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
}

export async function deleteTask(taskId: string, projectId: string) {
  const task = await getTaskById(taskId, projectId);
  await prisma.task.delete({ where: { id: task.id } });
}
