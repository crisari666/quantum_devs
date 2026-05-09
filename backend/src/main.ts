import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PROJECT_IMAGES_DIR } from './projects/project-image-upload.config';

async function bootstrap() {
  if (!existsSync(PROJECT_IMAGES_DIR)) {
    mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads/',
    index: false,
    fallthrough: true,
  });
  const origins =
    process.env.CORS_ORIGINS?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? [];
  app.enableCors({
    origin: '*',
    // credentials: true,
  });
  app.setGlobalPrefix('api');
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //   }),
  // );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Quantum Devs Portfolio CMS API')
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? '3000';
  await app.listen(port);
}
void bootstrap();
