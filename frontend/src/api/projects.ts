import client from './client';

export const listProjects = () => client.get('/projects');
export const createProject = (data: { name: string; description?: string }) => client.post('/projects', data);
export const getProject = (id: string) => client.get(`/projects/${id}`);
export const updateProject = (id: string, data: { name?: string; description?: string }) => client.put(`/projects/${id}`, data);
export const deleteProject = (id: string) => client.delete(`/projects/${id}`);
