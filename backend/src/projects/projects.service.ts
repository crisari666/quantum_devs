import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TechnologiesService } from '../technologies/technologies.service';
import { ProjectWriteDto } from './dto/project-write.dto';
import { Project, ProjectDocument } from './schemas/project.schema';
import { TechnologyDocument } from '../technologies/schemas/technology.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly technologiesService: TechnologiesService,
  ) {}

  async findAllPublicPopulated(): Promise<ProjectDocument[]> {
    return this.projectModel
      .find()
      .populate('technologies')
      .sort({ featured: -1, createdAt: -1 })
      .exec();
  }

  toPublicProjectJson(
    doc: ProjectDocument,
    populated: TechnologyDocument[] | undefined,
  ) {
    const techs = populated ?? [];
    return {
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      url: doc.url,
      images: doc.images ?? [],
      githubUrl: doc.githubUrl ?? null,
      featured: doc.featured,
      technologies: techs.map((t) => this.technologiesService.toPublicJson(t)),
    };
  }

  async listPublicSerialized() {
    const docs = await this.findAllPublicPopulated();
    return docs.map((d) =>
      this.toPublicProjectJson(
        d,
        d.populated('technologies')
          ? (d.technologies as unknown as TechnologyDocument[])
          : [],
      ),
    );
  }

  async findAdminById(id: string): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Project not found');
    }
    const doc = await this.projectModel
      .findById(new Types.ObjectId(id))
      .populate('technologies')
      .exec();
    if (!doc) {
      throw new NotFoundException('Project not found');
    }
    return doc;
  }

  async listAdminPaginated(params: {
    page: number;
    limit: number;
    q?: string;
    technologyId?: string;
    featured?: boolean;
  }) {
    const filter: Record<string, unknown> = {};
    if (params.q?.trim()) {
      const rx = new RegExp(
        params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ title: rx }, { description: rx }];
    }
    if (params.technologyId && Types.ObjectId.isValid(params.technologyId)) {
      filter.technologies = new Types.ObjectId(params.technologyId);
    }
    if (typeof params.featured === 'boolean') {
      filter.featured = params.featured;
    }
    const skip = (params.page - 1) * params.limit;
    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .populate('technologies')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);
    return { items, total, page: params.page, limit: params.limit };
  }

  private mapWriteDtoToDoc(dto: ProjectWriteDto, techIds: Types.ObjectId[]) {
    return {
      title: dto.title.trim(),
      description: dto.description.trim(),
      url: dto.url.trim(),
      images: dto.images?.map((i) => i.trim()) ?? [],
      githubUrl: dto.githubUrl?.trim(),
      featured: dto.featured,
      technologies: techIds,
    };
  }

  async create(dto: ProjectWriteDto): Promise<ProjectDocument> {
    const techIds = dto.technologyIds.map((id) => new Types.ObjectId(id));
    await this.technologiesService.assertAllExist(techIds);
    const created = await this.projectModel.create(
      this.mapWriteDtoToDoc(dto, techIds),
    );
    return (
      (await this.projectModel
        .findById(created._id)
        .populate('technologies')
        .exec()) ?? created
    );
  }

  async update(id: string, dto: ProjectWriteDto): Promise<ProjectDocument> {
    const existing = await this.findAdminById(id);
    const techIds = dto.technologyIds.map((tid) => new Types.ObjectId(tid));
    await this.technologiesService.assertAllExist(techIds);
    Object.assign(existing, this.mapWriteDtoToDoc(dto, techIds));
    await existing.save();
    return (
      (await this.projectModel
        .findById(existing._id)
        .populate('technologies')
        .exec()) ?? existing
    );
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findAdminById(id);
    await existing.deleteOne();
  }
}
