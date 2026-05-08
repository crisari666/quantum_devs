import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TechnologyDocument = HydratedDocument<Technology>;

@Schema({ timestamps: true })
export class Technology {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true, unique: true })
  nameNormalized!: string;

  @Prop({ required: true })
  iconKey!: string;

  @Prop({ required: true })
  category!: string;
}

export const TechnologySchema = SchemaFactory.createForClass(Technology);
