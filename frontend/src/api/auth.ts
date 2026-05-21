import client from './client';

export const signup = (data: { name: string; email: string; password: string }) =>
  client.post('/auth/signup', data);

export const login = (data: { email: string; password: string }) =>
  client.post('/auth/login', data);
