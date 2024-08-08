import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EnterpriseDocument = HydratedDocument<Enterprise>;

@Schema()
export class Enterprise {
  @Prop()
  name: string;

  @Prop()
  region: string;

  @Prop()
  description: string;

  @Prop()
  userId: string;
}

export const EnterpriseSchema = SchemaFactory.createForClass(Enterprise);
