import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createE2eApp } from './create-test-app';

describe('Headless flow (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    const ctx = await createE2eApp();
    app = ctx.app;
    mongo = ctx.mongo;
  }, 120000);

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('admin mutation is visible on public GET', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'password12' })
      .expect(201);
    const token = login.body.accessToken as string;

    const tech = await request(app.getHttpServer())
      .post('/api/admin/technologies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Go', iconKey: 'go', category: 'Language' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Public Project',
        description: 'Hello',
        url: 'https://example.org',
        featured: true,
        technologyIds: [tech.body._id],
      })
      .expect(201);

    const pub = await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200);
    expect(pub.body.length).toBe(1);
    expect(pub.body[0].title).toBe('Public Project');
    expect(pub.body[0].technologies[0].name).toBe('Go');
  });
});
