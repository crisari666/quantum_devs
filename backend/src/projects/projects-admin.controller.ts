import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { projectImagesMulterOptions } from './project-image-upload.config';
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

  @Post('upload-images')
  @ApiOperation({
    summary: 'Upload project images (JPEG, PNG, GIF, WebP; max 5MB each)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Public URL paths for stored files' })
  @UseInterceptors(FilesInterceptor('files', 20, projectImagesMulterOptions))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No image files provided');
    }
    const urls = files.map((f) => `/uploads/projects/${f.filename}`);
    return { urls };
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
