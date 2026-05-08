import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createE2eApp } from './create-test-app';

describe('Admin projects (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let token: string;
  let technologyId: string;

  beforeAll(async () => {
    const ctx = await createE2eApp();
    app = ctx.app;
    mongo = ctx.mongo;
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'password12' });
    token = login.body.accessToken as string;

    const tech = await request(app.getHttpServer())
      .post('/api/admin/technologies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'TypeScript', iconKey: 'typescript', category: 'Language' })
      .expect(201);
    technologyId = tech.body._id as string;
  }, 120000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('lists projects with pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/projects?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBe(0);
  });

  it('creates, reads, updates, and deletes a project', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Demo',
        description: 'Desc',
        url: 'https://example.com',
        featured: false,
        technologyIds: [technologyId],
      })
      .expect(201);
    const id = created.body._id as string;
    expect(created.body.technologies[0]._id).toBe(technologyId);

    await request(app.getHttpServer())
      .get(`/api/admin/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/admin/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Demo 2',
        description: 'Desc 2',
        url: 'https://example.com',
        featured: true,
        technologyIds: [technologyId],
      })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/admin/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
