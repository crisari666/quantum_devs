import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('Public')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects with technologies populated' })
  @ApiOkResponse({ description: 'OK' })
  async list() {
    return this.projectsService.listPublicSerialized();
  }
}
