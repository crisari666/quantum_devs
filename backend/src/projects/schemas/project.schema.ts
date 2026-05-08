import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Technology } from '../../technologies/schemas/technology.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, maxlength: 200 })
  title!: string;

  @Prop({ required: true, maxlength: 10000 })
  description!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ required: false })
  githubUrl?: string;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: Technology.name }], default: [] })
  technologies!: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ featured: 1, createdAt: -1 });
