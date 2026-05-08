import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @MinLength(8)
  password!: string;
}
