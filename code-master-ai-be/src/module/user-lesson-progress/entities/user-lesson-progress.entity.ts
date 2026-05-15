import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserLessonProgressDocument = HydratedDocument<UserLessonProgress>;

export enum ActivityProgressStatus {
  LOCKED = 'LOCKED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Schema({ _id: false })
export class VideoProgress {
  @Prop({
    type: String,
    enum: Object.values(ActivityProgressStatus),
    default: ActivityProgressStatus.LOCKED,
  })
  status!: ActivityProgressStatus;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  watchPercent!: number;

  @Prop({ type: Date, default: null })
  unlockedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;
}

@Schema({ _id: false })
export class QuizProgress {
  @Prop({
    type: String,
    enum: Object.values(ActivityProgressStatus),
    default: ActivityProgressStatus.LOCKED,
  })
  status!: ActivityProgressStatus;

  @Prop({ type: Number, default: null })
  score!: number | null;

  @Prop({ type: Boolean, default: null })
  passed!: boolean | null;

  @Prop({ type: Number, min: 0, default: 0 })
  attemptsCount!: number;

  @Prop({ type: Types.ObjectId, default: null, ref: 'QuizSubmission' })
  lastSubmissionId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  submittedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;
}

@Schema({ _id: false })
export class AssignmentProgress {
  @Prop({
    type: String,
    enum: Object.values(ActivityProgressStatus),
    default: ActivityProgressStatus.LOCKED,
  })
  status!: ActivityProgressStatus;

  @Prop({ type: Number, default: null })
  score!: number | null;

  @Prop({ type: Boolean, default: null })
  passed!: boolean | null;

  @Prop({ type: Number, min: 0, default: 0 })
  attemptsCount!: number;

  @Prop({ type: Types.ObjectId, default: null, ref: 'Submission' })
  lastSubmissionId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  submittedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;
}

@Schema({ timestamps: { createdAt: false, updatedAt: true } })
export class UserLessonProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true, index: true })
  lessonId!: Types.ObjectId;

  @Prop({ type: Number, min: 0, default: 0 })
  lessonOrder!: number;

  @Prop({ type: VideoProgress, default: () => ({}) })
  video!: VideoProgress;

  @Prop({ type: QuizProgress, default: () => ({}) })
  quiz!: QuizProgress;

  @Prop({ type: AssignmentProgress, default: () => ({}) })
  assignment!: AssignmentProgress;

  @Prop({
    type: String,
    enum: Object.values(ActivityProgressStatus),
    default: ActivityProgressStatus.LOCKED,
  })
  lessonStatus!: ActivityProgressStatus;

  @Prop({ type: Boolean, default: false })
  fullyCompleted!: boolean;

  @Prop({ type: Date, default: null })
  unlockedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: Number, default: 2 })
  schemaVersion!: number;

  @Prop({ type: Date })
  updatedAt!: Date;
}

export const UserLessonProgressSchema =
  SchemaFactory.createForClass(UserLessonProgress);

UserLessonProgressSchema.index(
  { userId: 1, courseId: 1, lessonId: 1 },
  { unique: true },
);