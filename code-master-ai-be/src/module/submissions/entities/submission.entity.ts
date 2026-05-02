import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: true })
export class Submission {
  @Prop({ type: Types.ObjectId, ref: 'CodeAssignment', required: true })
  codeAssignment_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  code!: string;

  @Prop({ type: String, required: true })
  language!: string;

  @Prop({ type: Number, default: 0 })
  score!: number;

  @Prop({ type: String, default: 'pending' })
  status!: string;

  @Prop()
  ai_hint?: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
