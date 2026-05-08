import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

function jwtExpiresInSeconds(expiresIn: string): number {
  const m = expiresIn.trim().match(/^(\d+)([smhd])$/i);
  if (!m) {
    return 86400;
  }
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  const mult = u === 's' ? 1 : u === 'm' ? 60 : u === 'h' ? 3600 : 86400;
  return n * mult;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
    expiresInConfig: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const expiresSeconds = jwtExpiresInSeconds(expiresInConfig);
    const accessToken = await this.jwtService.signAsync(
      { sub: user._id.toString(), email: user.email },
      { expiresIn: expiresSeconds },
    );
    return {
      accessToken,
      expiresIn: expiresSeconds,
    };
  }
}
