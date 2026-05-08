import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class TechnologyWriteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  iconKey!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category!: string;
}
