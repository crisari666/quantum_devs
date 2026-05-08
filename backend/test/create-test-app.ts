import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

function applyMongoConnectionEnvFromUri(uri: string): void {
  const parsed = new URL(uri);
  process.env.MONGO_DB_HOST = parsed.hostname;
  process.env.MONGO_DB_PORT = parsed.port || '27017';
  const pathDb = parsed.pathname.replace(/^\//, '');
  process.env.MONGO_DB_NAME = pathDb || 'test';
  if (parsed.username) {
    process.env.MONGO_DB_USER = decodeURIComponent(parsed.username);
    process.env.MONGO_DB_PASSWORD = decodeURIComponent(parsed.password);
  } else {
    delete process.env.MONGO_DB_USER;
    delete process.env.MONGO_DB_PASSWORD;
  }
}

export async function createE2eApp(): Promise<{
  app: INestApplication;
  mongo: MongoMemoryServer;
}> {
  const mongo = await MongoMemoryServer.create();
  applyMongoConnectionEnvFromUri(mongo.getUri());
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing-at-least-32-chars';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CORS_ORIGINS = 'http://localhost:5173';
  process.env.ADMIN_SEED_EMAIL = 'admin@test.dev';
  process.env.ADMIN_SEED_PASSWORD = 'password12';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return { app, mongo };
}
