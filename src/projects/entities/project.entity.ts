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
  area: string;

  @Prop()
  enterprise_id: string;

  @Prop()
  image: string;

  @Prop()
  model: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
