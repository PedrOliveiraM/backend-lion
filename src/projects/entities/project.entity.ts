import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop()
  area: number;

  @Prop()
  model: string;

  @Prop()
  enterprise_id: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
