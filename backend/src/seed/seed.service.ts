import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.configService.get<string>('ADMIN_SEED_EMAIL');
    const password = this.configService.get<string>('ADMIN_SEED_PASSWORD');
    if (!email || !password) {
      return;
    }
    await this.usersService.ensureSeedUser(email, password);
    this.logger.log(`Seed admin ensured for ${email}`);
  }
}
