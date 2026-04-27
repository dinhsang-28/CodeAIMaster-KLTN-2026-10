import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchema } from './entities/submission.entity';

import { CodeAssignment, CodeAssignmentSchema } from '../code-assignments/entities/code-assignment.entity'; 
import { TestCase, TestCaseSchema } from '../testcases/entities/testcase.entity';
import { AiAssistantModule } from '@/ai-assistant/ai-assistant.module';
import { UserLessonProgressModule } from '../user-lesson-progress/user-lesson-progress.module';
import { Course, CourseSchema } from '../courses/entities/course.entity';
import { Advisory, AdvisorySchema } from './entities/advisory.entity';

@Module({
  imports: [
    HttpModule,
    AiAssistantModule,
    UserLessonProgressModule,
    //  3 bảng cần thiết cho luồng chấm bài
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: CodeAssignment.name, schema: CodeAssignmentSchema },
      { name: TestCase.name, schema: TestCaseSchema },
      {name:Course.name,schema:CourseSchema},
      {name:Advisory.name, schema: AdvisorySchema}
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
