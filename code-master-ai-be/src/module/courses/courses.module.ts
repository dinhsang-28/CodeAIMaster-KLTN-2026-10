import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './entities/course.entity';
import { Course } from './entities/course.entity';
import { CategoriesModule } from '../categories/categories.module';
import { Lesson, LessonSchema } from '../lessons/entities/lesson.entity';
import { UploadModule } from '@/upload/upload.module';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/entities/assignment.entity';
import { Quiz, QuizSchema } from '../quizzes/entities/quiz.entity';
import {
  Question,
  QuestionSchema,
} from '../questions/entities/question.entity';
import {
  CodeAssignment,
  CodeAssignmentSchema,
} from '../code-assignments/entities/code-assignment.entity';
import {
  CartDetail,
  CartDetailSchema,
} from '../cart-details/entities/cart-detail.entity';
import {
  Enrollment,
  EnrollmentSchema,
} from '../enrollments/entities/enrollment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: CodeAssignment.name, schema: CodeAssignmentSchema },
      { name: CartDetail.name, schema: CartDetailSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
    CategoriesModule,
    UploadModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
