import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';

@ApiTags('Public')
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all technologies' })
  @ApiOkResponse({ description: 'OK' })
  async list() {
    const docs = await this.technologiesService.findAllPublic();
    return docs.map((d) => this.technologiesService.toPublicJson(d));
  }
}
