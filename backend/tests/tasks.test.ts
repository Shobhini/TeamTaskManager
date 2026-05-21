import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

let adminToken: string;
let memberToken: string;
let projectId: string;
let taskId: string;
let memberId: string;

beforeAll(async () => {
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const admin = await request(app).post('/api/auth/signup').send({
    name: 'Admin', email: 'admin2@test.com', password: 'password123',
  });
  adminToken = admin.body.token;

  const member = await request(app).post('/api/auth/signup').send({
    name: 'Member', email: 'member@test.com', password: 'password123',
  });
  memberToken = member.body.token;
  memberId = member.body.user.id;

  const proj = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Task Project' });
  projectId = proj.body.project.id;

  await request(app)
    .post(`/api/projects/${projectId}/members`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ email: 'member@test.com', role: 'MEMBER' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/projects/:id/tasks', () => {
  it('ADMIN can create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Fix bug', priority: 'HIGH' });
    expect(res.status).toBe(201);
    taskId = res.body.task.id;
  });

  it('MEMBER cannot create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Another task' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/projects/:id/tasks', () => {
  it('MEMBER can list tasks', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/projects/:id/tasks/:taskId', () => {
  it('MEMBER can update task status', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('IN_PROGRESS');
  });

  it('MEMBER cannot update task title', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New title' });
    expect(res.status).toBe(403);
  });

  it('ADMIN can update any task field', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated title', assigneeId: memberId });
    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated title');
  });
});

describe('DELETE /api/projects/:id/tasks/:taskId', () => {
  it('ADMIN can delete a task', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
