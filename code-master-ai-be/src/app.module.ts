import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { AssignmentsModule } from './module/assignments/assignments.module';
import { CartDetailsModule } from './module/cart-details/cart-details.module';
import { CartsModule } from './module/carts/carts.module';
import { CategoriesModule } from './module/categories/categories.module';
import { CodeAssignmentsModule } from './module/code-assignments/code-assignments.module';
import { CoursesModule } from './module/courses/courses.module';
import { EnrollmentsModule } from './module/enrollments/enrollments.module';
import { LessonsModule } from './module/lessons/lessons.module';
import { OrderDetailsModule } from './module/order-details/order-details.module';
import { OrdersModule } from './module/orders/orders.module';
import { PaymentsModule } from './module/payments/payments.module';
import { QuestionsModule } from './module/questions/questions.module';
import { QuizzesModule } from './module/quizzes/quizzes.module';
import { ResultsModule } from './module/results/results.module';
import { RolesModule } from './module/roles/roles.module';
import { SubmissionsModule } from './module/submissions/submissions.module';
import { TestcasesModule } from './module/testcases/testcases.module';
import { BlogsModule } from './module/blogs/blogs.module';
import { StatisticsModule } from './module/statistics/statistics.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { UserLessonProgressModule } from './module/user-lesson-progress/user-lesson-progress.module';
import { ProgressModule } from './module/progress/progress.module';

@Module({
  imports: [
    UsersModule,
    AssignmentsModule,
    CartDetailsModule,
    CartsModule,
    CategoriesModule,
    CodeAssignmentsModule,
    CoursesModule,
    EnrollmentsModule,
    LessonsModule,
    OrderDetailsModule,
    OrdersModule,
    PaymentsModule,
    QuestionsModule,
    QuizzesModule,
    ResultsModule,
    RolesModule,
    SubmissionsModule,
    TestcasesModule,
    UserLessonProgressModule,
    ProgressModule,
    // nap bien cuc bo .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // cau hinh ket noi mongodb
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    //  Cấu hình Mailer để sửa lỗi UnknownDependenciesException
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"CodeMaster AI" <no-reply@codemaster.ai>',
        },
        template: {
          // dir: process.cwd() + 'dist/mail/template/',
          dir: join(__dirname, 'mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    BlogsModule,

    StatisticsModule,
    AiAssistantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
