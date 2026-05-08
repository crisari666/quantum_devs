import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TechnologyWriteDto } from './dto/technology-write.dto';
import { TechnologiesService } from './technologies.service';

@ApiTags('AdminTechnologies')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('admin/technologies')
export class TechnologiesAdminController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'List technologies (admin)' })
  @ApiOkResponse({ description: 'OK' })
  async list() {
    const docs = await this.technologiesService.findAllPublic();
    return docs.map((d) => this.technologiesService.toPublicJson(d));
  }

  @Post()
  @ApiOperation({ summary: 'Create technology' })
  @ApiCreatedResponse({ description: 'Created' })
  @ApiConflictResponse({ description: 'Duplicate name' })
  async create(@Body() dto: TechnologyWriteDto) {
    const doc = await this.technologiesService.create(dto);
    return this.technologiesService.toPublicJson(doc);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update technology' })
  @ApiOkResponse({ description: 'Updated' })
  @ApiConflictResponse({ description: 'Duplicate name' })
  async update(@Param('id') id: string, @Body() dto: TechnologyWriteDto) {
    const doc = await this.technologiesService.update(id, dto);
    return this.technologiesService.toPublicJson(doc);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete technology (blocked if referenced)' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiConflictResponse({ description: 'In use by one or more projects' })
  async remove(@Param('id') id: string) {
    await this.technologiesService.remove(id);
  }
}
