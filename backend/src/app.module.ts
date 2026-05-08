import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { SeedModule } from './seed/seed.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { UsersModule } from './users/users.module';

function buildMongoUri(config: ConfigService): string {
  const host = config.getOrThrow<string>('MONGO_DB_HOST');
  const port = config.getOrThrow<string>('MONGO_DB_PORT');
  const dbName = config.getOrThrow<string>('MONGO_DB_NAME');
  const user = config.get<string>('MONGO_DB_USER');
  const password = config.get<string>('MONGO_DB_PASSWORD');
  const hasCredentials =
    user !== undefined &&
    user !== '' &&
    password !== undefined &&
    password !== '';
  const auth = hasCredentials
    ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
    : '';
  return `mongodb://${auth}${host}:${port}/${dbName}`;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: buildMongoUri(config),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    TechnologiesModule,
    ProjectsModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
