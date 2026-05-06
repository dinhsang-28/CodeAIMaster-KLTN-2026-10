import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;
export enum NotificationType {
  SYSTEM = 'system',
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ enum: NotificationType, default: NotificationType.SYSTEM })
  type!: NotificationType;

  @Prop()
  link?: string;

  @Prop({ default: false })
  isRead!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
