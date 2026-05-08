import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ProjectWriteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description!: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  githubUrl?: string;

  @ApiProperty()
  @IsBoolean()
  featured!: boolean;

  @ApiProperty({ type: [String], description: 'Technology ObjectIds' })
  @IsArray()
  @IsString({ each: true })
  technologyIds!: string[];
}
