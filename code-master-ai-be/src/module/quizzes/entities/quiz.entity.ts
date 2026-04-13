import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: 'Assignment', required: true })
  assignment_id!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  time_limit?: number;

  @Prop()
  total_score?: number;
}
export const QuizSchema = SchemaFactory.createForClass(Quiz);
