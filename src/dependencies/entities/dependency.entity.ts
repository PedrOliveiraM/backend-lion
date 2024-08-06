import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DependencyDocument = HydratedDocument<Dependency>;

@Schema()
export class Dependency {
  @Prop()
  name: string;

  @Prop()
  project_id: string;
}

export const DependencySchema = SchemaFactory.createForClass(Dependency);
