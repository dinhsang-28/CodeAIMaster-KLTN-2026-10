import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz_id!: Types.ObjectId;

  @Prop({ required: true })
  question_text!: string;

  @Prop()
  option_a?: string;

  @Prop()
  option_b?: string;

  @Prop()
  option_c?: string;

  @Prop()
  option_d?: string;

  @Prop({ required: true })
  correct_answer!: string;

  @Prop()
  score?: number;
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
