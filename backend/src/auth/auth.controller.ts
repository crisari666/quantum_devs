import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Administrator login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d';
    return this.authService.login(body.email, body.password, expiresIn);
  }
}
