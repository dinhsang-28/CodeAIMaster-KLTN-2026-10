import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressService } from './progress.service';
import { Result, ResultSchema } from '../results/entities/result.entity';
import {
  UserLessonProgress,
  UserLessonProgressSchema,
} from '../user-lesson-progress/entities/user-lesson-progress.entity';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: UserLessonProgress.name, schema: UserLessonProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
