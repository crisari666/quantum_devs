import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createE2eApp } from './create-test-app';

describe('Public catalog (e2e)', () => {
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

  it('GET /api/projects returns empty array when no data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([]);
  });

  it('GET /api/technologies returns empty array when no data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/technologies')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([]);
  });
});
