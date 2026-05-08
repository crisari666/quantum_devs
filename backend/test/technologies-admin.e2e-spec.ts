import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createE2eApp } from './create-test-app';

describe('Admin technologies (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    const ctx = await createE2eApp();
    app = ctx.app;
    mongo = ctx.mongo;
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'password12' });
    token = login.body.accessToken as string;
  }, 120000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('rejects duplicate technology names case-insensitively', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/technologies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'React', iconKey: 'react', category: 'Frontend' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/admin/technologies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'react', iconKey: 'react2', category: 'Frontend' })
      .expect(409);
  });

  it('blocks delete when technology is linked to a project', async () => {
    const tech = await request(app.getHttpServer())
      .post('/api/admin/technologies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'NestJS', iconKey: 'nest', category: 'Backend' })
      .expect(201);
    const techId = tech.body._id as string;

    await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Uses Nest',
        description: 'x',
        url: 'https://example.com',
        featured: false,
        technologyIds: [techId],
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/admin/technologies/${techId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });
});
