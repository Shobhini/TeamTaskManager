import client from './client';

export const listMembers = (projectId: string) => client.get(`/projects/${projectId}/members`);
export const addMember = (projectId: string, data: { email: string; role?: string }) => client.post(`/projects/${projectId}/members`, data);
export const updateMemberRole = (projectId: string, userId: string, role: string) => client.put(`/projects/${projectId}/members/${userId}`, { role });
export const removeMember = (projectId: string, userId: string) => client.delete(`/projects/${projectId}/members/${userId}`);
