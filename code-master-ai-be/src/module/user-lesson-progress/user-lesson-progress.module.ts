import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserLessonProgress,
  UserLessonProgressSchema,
} from './entities/user-lesson-progress.entity';
import { UserLessonProgressService } from './user-lesson-progress.service';
import { UserLessonProgressController } from './user-lesson-progress.controller';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';
import { Assignment, AssignmentSchema } from '../assignments/entities/assignment.entity';
import { Submission, SubmissionSchema } from '../submissions/entities/submission.entity';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserLessonProgress.name, schema: UserLessonProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    ProgressModule,
  ],
  controllers: [UserLessonProgressController],
  providers: [UserLessonProgressService],
  exports: [UserLessonProgressService],
})
export class UserLessonProgressModule {}
