import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechnologiesModule } from '../technologies/technologies.module';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectsAdminController } from './projects-admin.controller';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    TechnologiesModule,
  ],
  controllers: [ProjectsController, ProjectsAdminController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
