import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { TechnologyWriteDto } from './dto/technology-write.dto';
import { Technology, TechnologyDocument } from './schemas/technology.schema';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<TechnologyDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }

  async findAllPublic(): Promise<TechnologyDocument[]> {
    return this.technologyModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<TechnologyDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.technologyModel.findById(new Types.ObjectId(id)).exec();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<TechnologyDocument[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.technologyModel.find({ _id: { $in: ids } }).exec();
  }

  async assertAllExist(ids: Types.ObjectId[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const count = await this.technologyModel.countDocuments({
      _id: { $in: ids },
    });
    if (count !== ids.length) {
      throw new NotFoundException('One or more technologies were not found');
    }
  }

  async create(dto: TechnologyWriteDto): Promise<TechnologyDocument> {
    const nameNormalized = this.normalizeName(dto.name);
    const dup = await this.technologyModel.findOne({ nameNormalized }).exec();
    if (dup) {
      throw new ConflictException('A technology with this name already exists');
    }
    return this.technologyModel.create({
      name: dto.name.trim(),
      nameNormalized,
      iconKey: dto.iconKey.trim(),
      category: dto.category.trim(),
    });
  }

  async update(
    id: string,
    dto: TechnologyWriteDto,
  ): Promise<TechnologyDocument> {
    const tech = await this.findById(id);
    if (!tech) {
      throw new NotFoundException('Technology not found');
    }
    const nameNormalized = this.normalizeName(dto.name);
    const dup = await this.technologyModel
      .findOne({ nameNormalized, _id: { $ne: tech._id } })
      .exec();
    if (dup) {
      throw new ConflictException('A technology with this name already exists');
    }
    tech.name = dto.name.trim();
    tech.nameNormalized = nameNormalized;
    tech.iconKey = dto.iconKey.trim();
    tech.category = dto.category.trim();
    return tech.save();
  }

  async remove(id: string): Promise<void> {
    const tech = await this.findById(id);
    if (!tech) {
      throw new NotFoundException('Technology not found');
    }
    const inUse = await this.projectModel.countDocuments({
      technologies: tech._id,
    });
    if (inUse > 0) {
      throw new ConflictException(
        `Technology is in use by ${inUse} project(s); detach it before deleting`,
      );
    }
    await tech.deleteOne();
  }

  toPublicJson(doc: TechnologyDocument) {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      iconKey: doc.iconKey,
      category: doc.category,
    };
  }
}
