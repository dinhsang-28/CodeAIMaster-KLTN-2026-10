import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from '../results/entities/result.entity';
import {
  ActivityProgressStatus,
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

  async recalculateCourseProgress(userId: string, courseId: string) {
    const summary = await this.getCourseProgress(userId, courseId);
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);

    await this.resultModel.findOneAndUpdate(
      { user_id: userObjectId, course_id: courseObjectId },
      {
        progress_percent: summary.progressPercent,
        completed:
          summary.totalActivities > 0 &&
          summary.completedActivities >= summary.totalActivities,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return summary;
  }

  async recalculate(userId: string, courseId: string) {
    return this.recalculateCourseProgress(userId, courseId);
  }

  async getCourseProgress(userId: string, courseId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);

    const [totalLessons, progresses] = await Promise.all([
      this.lessonModel.countDocuments({
        $or: [{ course_id: courseObjectId }, { course_id: courseId }],
      }),
      this.userLessonProgressModel
        .find({
          userId: userObjectId,
          courseId: courseObjectId,
        })
        .lean()
        .exec(),
    ]);

    const totalActivities = totalLessons * 3;
    const isLessonCompleted = (progress: UserLessonProgress) =>
      progress.fullyCompleted === true ||
      (progress.video?.status === ActivityProgressStatus.COMPLETED &&
        progress.quiz?.status === ActivityProgressStatus.COMPLETED &&
        progress.assignment?.status === ActivityProgressStatus.COMPLETED);

    const completedLessons = progresses.filter(isLessonCompleted).length;
    const completedActivities = progresses.reduce((count, progress) => {
      return (
        count +
        Number(progress.video?.status === ActivityProgressStatus.COMPLETED) +
        Number(progress.quiz?.status === ActivityProgressStatus.COMPLETED) +
        Number(
          progress.assignment?.status === ActivityProgressStatus.COMPLETED,
        )
      );
    }, 0);

    const progressPercent =
      totalActivities === 0
        ? 0
        : Number(((completedActivities / totalActivities) * 100).toFixed(2));

    return {
      courseId,
      totalLessons,
      completedLessons,
      totalActivities,
      completedActivities,
      progressPercent,
    };
  }
}
