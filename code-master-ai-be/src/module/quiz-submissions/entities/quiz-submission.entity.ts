import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizSubmissionDocument = HydratedDocument<QuizSubmission>;

@Schema({ timestamps: false })
export class QuizSubmissionAnswer {
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId!: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  selectedAnswers!: string[];
}

@Schema({ timestamps: true })
export class QuizSubmission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
  lessonId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true, index: true })
  quizId!: Types.ObjectId;

  @Prop({ type: [QuizSubmissionAnswer], default: [] })
  answers!: QuizSubmissionAnswer[];

  @Prop({ type: Number, default: 0 })
  score!: number;

  @Prop({ type: Boolean, default: false })
  passed!: boolean;

  @Prop({ type: Date, default: Date.now })
  submittedAt!: Date;
}

export const QuizSubmissionSchema =
  SchemaFactory.createForClass(QuizSubmission);

QuizSubmissionSchema.index({ userId: 1, courseId: 1, lessonId: 1, quizId: 1 });