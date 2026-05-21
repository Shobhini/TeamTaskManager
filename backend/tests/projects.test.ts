import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

let token: string;
let projectId: string;

beforeAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const res = await request(app).post('/api/auth/signup').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/projects', () => {
  it('creates a project and auto-adds creator as ADMIN', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project', description: 'A test project' });
    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('Test Project');
    projectId = res.body.project.id;

    const member = await prisma.projectMember.findFirst({
      where: { projectId },
    });
    expect(member?.role).toBe('ADMIN');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/projects', () => {
  it('lists projects the user belongs to', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });
});

describe('GET /api/projects/:id', () => {
  it('returns project details', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.project.id).toBe(projectId);
    expect(res.body.project.members).toBeDefined();
  });
});

describe('PUT /api/projects/:id', () => {
  it('updates project name as ADMIN', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Project' });
    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe('Updated Project');
  });
});

describe('DELETE /api/projects/:id', () => {
  it('deletes the project as ADMIN', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
