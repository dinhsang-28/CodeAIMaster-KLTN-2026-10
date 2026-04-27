import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from '../results/entities/result.entity';
import {
  UserLessonProgress,
  UserLessonProgressDocument,
} from '../user-lesson-progress/entities/user-lesson-progress.entity';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Result.name)
    private readonly resultModel: Model<ResultDocument>,
    @InjectModel(UserLessonProgress.name)
    private readonly userLessonProgressModel: Model<UserLessonProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async recalculate(userId: string, courseId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);

    const [totalLessons, completedLessons] = await Promise.all([
      this.lessonModel.countDocuments({ course_id: courseObjectId }),
      this.userLessonProgressModel.countDocuments({
        userId: userObjectId,
        courseId: courseObjectId,
        isCompleted: true,
      }),
    ]);

    const progressPercent =
      totalLessons === 0
        ? 0
        : Number(((completedLessons / totalLessons) * 100).toFixed(2));

    await this.resultModel.findOneAndUpdate(
      { user_id: userObjectId, course_id: courseObjectId },
      {
        progress_percent: progressPercent,
        completed: totalLessons > 0 && completedLessons >= totalLessons,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return {
      userId,
      courseId,
      totalLessons,
      completedLessons,
      progressPercent,
    };
  }
}
