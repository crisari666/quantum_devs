import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ProjectWriteDto } from './dto/project-write.dto';
import { ProjectsService } from './projects.service';
import { TechnologyDocument } from '../technologies/schemas/technology.schema';

@ApiTags('AdminProjects')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'Paginated project list for admin (search, filter, featured)',
  })
  @ApiOkResponse({ description: 'Paginated result' })
  async list(@Query() query: PaginationQueryDto) {
    const { items, total, page, limit } =
      await this.projectsService.listAdminPaginated({
        page: query.page,
        limit: query.limit,
        q: query.q,
        technologyId: query.technologyId,
        featured: query.featured,
      });
    return {
      items: items.map((d) =>
        this.projectsService.toPublicProjectJson(
          d,
          d.populated('technologies')
            ? (d.technologies as unknown as TechnologyDocument[])
            : [],
        ),
      ),
      total,
      page,
      limit,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiCreatedResponse({ description: 'Created' })
  async create(@Body() dto: ProjectWriteDto) {
    const doc = await this.projectsService.create(dto);
    return this.projectsService.toPublicProjectJson(
      doc,
      doc.populated('technologies')
        ? (doc.technologies as unknown as TechnologyDocument[])
        : [],
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single project (admin)' })
  @ApiOkResponse({ description: 'OK' })
  async getOne(@Param('id') id: string) {
    const doc = await this.projectsService.findAdminById(id);
    return this.projectsService.toPublicProjectJson(
      doc,
      doc.populated('technologies')
        ? (doc.technologies as unknown as TechnologyDocument[])
        : [],
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiOkResponse({ description: 'Updated' })
  async update(@Param('id') id: string, @Body() dto: ProjectWriteDto) {
    const doc = await this.projectsService.update(id, dto);
    return this.projectsService.toPublicProjectJson(
      doc,
      doc.populated('technologies')
        ? (doc.technologies as unknown as TechnologyDocument[])
        : [],
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete project' })
  @ApiNoContentResponse({ description: 'Deleted' })
  async remove(@Param('id') id: string) {
    await this.projectsService.remove(id);
  }
}
