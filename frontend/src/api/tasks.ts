import client from './client';

export const listTasks = (projectId: string, params?: { status?: string; assigneeId?: string }) =>
  client.get(`/projects/${projectId}/tasks`, { params });
export const createTask = (projectId: string, data: object) => client.post(`/projects/${projectId}/tasks`, data);
export const getTask = (projectId: string, taskId: string) => client.get(`/projects/${projectId}/tasks/${taskId}`);
export const updateTask = (projectId: string, taskId: string, data: object) => client.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const deleteTask = (projectId: string, taskId: string) => client.delete(`/projects/${projectId}/tasks/${taskId}`);
