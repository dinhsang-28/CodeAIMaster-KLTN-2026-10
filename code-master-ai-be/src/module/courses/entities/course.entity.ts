import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CourseLevel } from '../enums/courseLevel.enum';
import { CourseStatus } from '../enums/courseStatus.enum';
import { Types } from 'mongoose';
export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({
    default: CourseLevel.BEGINNER,
  })
  level!: CourseLevel;

  @Prop()
  thumbnail!: string;

  @Prop({
    default: CourseStatus.ACTIVE,
  })
  status!: CourseStatus;

  //FK -> Category
  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category!: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  learning_outcomes!: string[];

  @Prop({ type: [String], default: [] })
  requirements!: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
