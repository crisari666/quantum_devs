import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createE2eApp } from './create-test-app';

describe('Auth (e2e)', () => {
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

  it('POST /api/auth/login rejects invalid password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'wrong-pass' })
      .expect(401);
  });

  it('POST /api/auth/login returns token for seeded admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'password12' })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(typeof res.body.expiresIn).toBe('number');
  });

  it('GET /api/admin/projects without token returns 401', async () => {
    await request(app.getHttpServer()).get('/api/admin/projects').expect(401);
  });
});
