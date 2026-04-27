import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserLessonProgressDocument = HydratedDocument<UserLessonProgress>;

export enum LessonProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: { createdAt: false, updatedAt: true } })
export class UserLessonProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
  lessonId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(LessonProgressStatus),
    default: LessonProgressStatus.NOT_STARTED,
  })
  status!: LessonProgressStatus;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  watchPercent!: number;

  @Prop({ type: Boolean, default: false })
  isCompleted!: boolean;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: Date })
  updatedAt!: Date;
}

export const UserLessonProgressSchema =
  SchemaFactory.createForClass(UserLessonProgress);

UserLessonProgressSchema.index(
  { userId: 1, courseId: 1, lessonId: 1 },
  { unique: true },
);
