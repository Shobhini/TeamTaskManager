import prisma from '../lib/prisma';

export async function getMyTasks(userId: string) {
  const now = new Date();
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return tasks.map((task) => ({
    ...task,
    overdue: task.dueDate !== null && task.dueDate < now && task.status !== 'DONE',
  }));
}
