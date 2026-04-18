import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  role_name!: string;
  @Prop([String]) 
  permissions!: string[];
  @Prop() description!: string;
}
export const RoleSchema = SchemaFactory.createForClass(Role);
