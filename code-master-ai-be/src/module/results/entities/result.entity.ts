import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResultDocument = HydratedDocument<Result>;

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id!: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  score!: number;

  @Prop({ type: Number, default: 0 })
  progress_percent!: number;

  @Prop({ type: Boolean, default: false })
  completed!: boolean;
}
export const ResultSchema = SchemaFactory.createForClass(Result);
