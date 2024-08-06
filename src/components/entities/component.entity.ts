import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ComponentDocument = HydratedDocument<Component>;

@Schema()
export class Component {
  @Prop()
  material: string;

  @Prop()
  quantity: number;

  @Prop()
  energy_efficiency: string;

  @Prop()
  element_id: string;
}

export const ComponentSchema = SchemaFactory.createForClass(Component);
