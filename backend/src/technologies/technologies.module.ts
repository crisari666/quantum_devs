import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Technology, TechnologySchema } from './schemas/technology.schema';
import { TechnologiesAdminController } from './technologies-admin.controller';
import { TechnologiesController } from './technologies.controller';
import { TechnologiesService } from './technologies.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Technology.name, schema: TechnologySchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [TechnologiesController, TechnologiesAdminController],
  providers: [TechnologiesService],
  exports: [TechnologiesService, MongooseModule],
})
export class TechnologiesModule {}
