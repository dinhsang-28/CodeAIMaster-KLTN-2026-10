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
import { Quiz, QuizSchema } from '../quizzes/entities/quiz.entity';
import { Question, QuestionSchema } from '../questions/entities/question.entity';
import { Assignment, AssignmentSchema } from '../assignments/entities/assignment.entity';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';
import {
  QuizSubmission,
  QuizSubmissionSchema,
} from '../quiz-submissions/entities/quiz-submission.entity';

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
      {name:Advisory.name, schema: AdvisorySchema},
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: QuizSubmission.name, schema: QuizSubmissionSchema },
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}