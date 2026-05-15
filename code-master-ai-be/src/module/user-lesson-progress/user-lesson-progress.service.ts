import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ActivityProgressStatus,
  AssignmentProgress,
  QuizProgress,
  UserLessonProgress,
  UserLessonProgressDocument,
  VideoProgress,
} from './entities/user-lesson-progress.entity';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';
import { ProgressService } from '../progress/progress.service';

type QuizSubmissionResult = {
  score: number;
  passed: boolean;
  submissionId?: string | Types.ObjectId | null;
  submittedAt?: Date;
};

type AssignmentSubmissionResult = {
  score: number;
  passed: boolean;
  submissionId?: string | Types.ObjectId | null;
  submittedAt?: Date;
};

@Injectable()
export class UserLessonProgressService {
  constructor(
    @InjectModel(UserLessonProgress.name)
    private readonly userLessonProgressModel: Model<UserLessonProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async getOrCreateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
  ) {
    const lesson = await this.findLessonOrThrow(lessonId, courseId);
    const progress = await this.ensureProgressDocument(
      userId,
      courseId,
      lesson,
      lesson.lesson_order ?? 0,
    );

    await this.synchronizeCourseProgress(userId, courseId);

    return this.userLessonProgressModel
      .findById(progress._id)
      .lean()
      .exec();
  }

  async openLesson(userId: string, lessonId: string) {
    const lesson = await this.lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const access = await this.computeLessonAccess(
      userId,
      String(lesson.course_id),
      lessonId,
    );

    if (!access.video.unlocked) {
      throw new ForbiddenException(access.video.message);
    }

    return this.getOrCreateLessonProgress(
      userId,
      String(lesson.course_id),
      lessonId,
    );
  }

  async markVideoProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    watchPercent: number,
  ) {
    const lesson = await this.findLessonOrThrow(lessonId, courseId);
    const progress = await this.ensureProgressDocument(
      userId,
      courseId,
      lesson,
      lesson.lesson_order ?? 0,
    );

    await this.synchronizeCourseProgress(userId, courseId);
    const access = await this.computeLessonAccess(userId, courseId, lessonId);
    if (!access.video.unlocked) {
      throw new ForbiddenException(access.video.message);
    }

    const normalizedWatchPercent = Number.isFinite(watchPercent)
      ? Math.max(0, Math.min(100, Math.round(watchPercent)))
      : 0;

    const nextWatchPercent = Math.max(
      progress.video?.watchPercent ?? 0,
      normalizedWatchPercent,
    );

    progress.video.watchPercent = nextWatchPercent;
    if (progress.video.status === ActivityProgressStatus.LOCKED) {
      progress.video.status = ActivityProgressStatus.IN_PROGRESS;
    }

    if (
      nextWatchPercent >= 100 &&
      progress.video.status !== ActivityProgressStatus.COMPLETED
    ) {
      progress.video.status = ActivityProgressStatus.COMPLETED;
      progress.video.completedAt = progress.video.completedAt ?? new Date();
    }

    await progress.save();
    await this.synchronizeCourseProgress(userId, courseId);

    return this.recalculateCourseProgress(userId, courseId);
  }

  async recordQuizSubmissionResult(
    userId: string,
    courseId: string,
    lessonId: string,
    result: QuizSubmissionResult,
  ) {
    const lesson = await this.findLessonOrThrow(lessonId, courseId);
    const progress = await this.ensureProgressDocument(
      userId,
      courseId,
      lesson,
      lesson.lesson_order ?? 0,
    );

    await this.synchronizeCourseProgress(userId, courseId);
    if (progress.video.status !== ActivityProgressStatus.COMPLETED) {
      throw new ForbiddenException(
        'Vui lòng hoàn thành video trước khi nộp quiz.',
      );
    }

    progress.quiz.attemptsCount = (progress.quiz.attemptsCount ?? 0) + 1;
    progress.quiz.score = result.score;
    progress.quiz.submittedAt = result.submittedAt ?? new Date();
    progress.quiz.lastSubmissionId = this.toObjectIdOrNull(result.submissionId);

    if (progress.quiz.status === ActivityProgressStatus.LOCKED) {
      progress.quiz.status = ActivityProgressStatus.IN_PROGRESS;
    }

    if (result.passed) {
      progress.quiz.passed = true;
      progress.quiz.status = ActivityProgressStatus.COMPLETED;
      progress.quiz.completedAt = progress.quiz.completedAt ?? new Date();
    } else if (progress.quiz.status !== ActivityProgressStatus.COMPLETED) {
      progress.quiz.passed = false;
      progress.quiz.status = ActivityProgressStatus.IN_PROGRESS;
    }

    await progress.save();
    await this.synchronizeCourseProgress(userId, courseId);

    return this.recalculateCourseProgress(userId, courseId);
  }

  async recordAssignmentSubmissionResult(
    userId: string,
    courseId: string,
    lessonId: string,
    result: AssignmentSubmissionResult,
  ) {
    const lesson = await this.findLessonOrThrow(lessonId, courseId);
    const progress = await this.ensureProgressDocument(
      userId,
      courseId,
      lesson,
      lesson.lesson_order ?? 0,
    );

    await this.synchronizeCourseProgress(userId, courseId);
    if (
      progress.quiz.status !== ActivityProgressStatus.COMPLETED ||
      progress.quiz.passed !== true
    ) {
      throw new ForbiddenException(
        'Vui lòng hoàn thành quiz trước khi nộp assignment.',
      );
    }

    progress.assignment.attemptsCount =
      (progress.assignment.attemptsCount ?? 0) + 1;
    progress.assignment.score = result.score;
    progress.assignment.submittedAt = result.submittedAt ?? new Date();
    progress.assignment.lastSubmissionId = this.toObjectIdOrNull(
      result.submissionId,
    );

    if (progress.assignment.status === ActivityProgressStatus.LOCKED) {
      progress.assignment.status = ActivityProgressStatus.IN_PROGRESS;
    }

    if (result.passed) {
      progress.assignment.passed = true;
      progress.assignment.status = ActivityProgressStatus.COMPLETED;
      progress.assignment.completedAt =
        progress.assignment.completedAt ?? new Date();
    } else if (progress.assignment.status !== ActivityProgressStatus.COMPLETED) {
      progress.assignment.passed = false;
      progress.assignment.status = ActivityProgressStatus.IN_PROGRESS;
    }

    await progress.save();
    await this.synchronizeCourseProgress(userId, courseId);

    return this.recalculateCourseProgress(userId, courseId);
  }

  async computeLessonAccess(userId: string, courseId: string, lessonId: string) {
    const detail = await this.getCourseProgressDetail(userId, courseId);
    const lesson = detail.lessons.find((item) => item.lessonId === lessonId);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      lessonId: lesson.lessonId,
      lessonStatus: lesson.lessonStatus,
      fullyCompleted: lesson.fullyCompleted,
      video: {
        unlocked: lesson.video.unlocked,
        lockedReason: lesson.video.lockedReason,
        message: lesson.video.message,
      },
      quiz: {
        unlocked: lesson.quiz.unlocked,
        lockedReason: lesson.quiz.lockedReason,
        message: lesson.quiz.message,
      },
      assignment: {
        unlocked: lesson.assignment.unlocked,
        lockedReason: lesson.assignment.lockedReason,
        message: lesson.assignment.message,
      },
    };
  }

  async getCourseProgressDetail(userId: string, courseId: string) {
    const { lessons, progresses } = await this.synchronizeCourseProgress(
      userId,
      courseId,
    );

    const totalActivities = lessons.length * 3;
    const completedActivities = progresses.reduce((count, progress) => {
      return (
        count +
        Number(progress.video.status === ActivityProgressStatus.COMPLETED) +
        Number(progress.quiz.status === ActivityProgressStatus.COMPLETED) +
        Number(progress.assignment.status === ActivityProgressStatus.COMPLETED)
      );
    }, 0);

    const progressPercent =
      totalActivities === 0
        ? 0
        : Number(((completedActivities / totalActivities) * 100).toFixed(2));

    const lessonDetails = lessons.map((lesson, index) => {
      const progress = progresses[index];
      const previousProgress = index > 0 ? progresses[index - 1] : null;

      const videoUnlocked =
        index === 0 ||
        previousProgress?.assignment.status === ActivityProgressStatus.COMPLETED;
      const quizUnlocked =
        progress.video.status === ActivityProgressStatus.COMPLETED;
      const assignmentUnlocked =
        progress.quiz.status === ActivityProgressStatus.COMPLETED &&
        progress.quiz.passed === true;

      return {
        lessonId: String(lesson._id),
        title: lesson.title,
        lessonOrder: lesson.lesson_order ?? index + 1,
        lessonStatus: progress.lessonStatus,
        fullyCompleted: progress.fullyCompleted,
        unlocked: videoUnlocked,
        lockedReason: videoUnlocked
          ? null
          : 'COMPLETE_PREVIOUS_LESSON_ASSIGNMENT',
        video: this.buildActivityResponse(
          progress.video,
          videoUnlocked,
          videoUnlocked ? null : 'COMPLETE_PREVIOUS_LESSON_ASSIGNMENT',
          'Vui lòng hoàn thành assignment của bài trước để mở video này.',
          {
            watchPercent: progress.video.watchPercent,
          },
        ),
        quiz: this.buildActivityResponse(
          progress.quiz,
          quizUnlocked,
          quizUnlocked ? null : 'COMPLETE_CURRENT_VIDEO_FIRST',
          'Vui lòng xem xong video trước khi làm trắc nghiệm.',
          {
            passed: progress.quiz.passed,
            score: progress.quiz.score,
            submittedAt: progress.quiz.submittedAt,
            attemptsCount: progress.quiz.attemptsCount,
          },
        ),
        assignment: this.buildActivityResponse(
          progress.assignment,
          assignmentUnlocked,
          assignmentUnlocked ? null : 'COMPLETE_CURRENT_QUIZ_FIRST',
          'Vui lòng hoàn thành quiz trước khi làm assignment.',
          {
            passed: progress.assignment.passed,
            score: progress.assignment.score,
            submittedAt: progress.assignment.submittedAt,
            attemptsCount: progress.assignment.attemptsCount,
          },
        ),
        legacyProgress: {
          isCompleted: progress.fullyCompleted,
          watchPercent: progress.video.watchPercent,
        },
      };
    });

    return {
      courseId,
      userId,
      totalActivities,
      completedActivities,
      progressPercent,
      lessons: lessonDetails,
    };
  }

  async recalculateCourseProgress(userId: string, courseId: string) {
    return this.progressService.recalculateCourseProgress(userId, courseId);
  }

  async updateVideoProgress(userId: string, lessonId: string, watchPercent: number) {
    const lesson = await this.lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.markVideoProgress(
      userId,
      String(lesson.course_id),
      lessonId,
      watchPercent,
    );
  }

  private async synchronizeCourseProgress(userId: string, courseId: string) {
    const lessons = await this.lessonModel
      .find({ course_id: courseId })
      .sort({ lesson_order: 1, _id: 1 })
      .lean()
      .exec();

    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);

    const existingProgresses = await this.userLessonProgressModel
      .find({
        userId: userObjectId,
        courseId: courseObjectId,
      })
      .exec();

    const progressByLessonId = new Map(
      existingProgresses.map((progress) => [String(progress.lessonId), progress]),
    );

    const progresses: UserLessonProgressDocument[] = [];

    for (const [index, lesson] of lessons.entries()) {
      const progress =
        progressByLessonId.get(String(lesson._id)) ??
        (await this.userLessonProgressModel.create({
          userId: userObjectId,
          courseId: courseObjectId,
          lessonId: lesson._id,
          lessonOrder: lesson.lesson_order ?? index + 1,
          video: {
            status:
              index === 0
                ? ActivityProgressStatus.IN_PROGRESS
                : ActivityProgressStatus.LOCKED,
            watchPercent: 0,
            unlockedAt: index === 0 ? new Date() : null,
            completedAt: null,
          },
          quiz: {
            status: ActivityProgressStatus.LOCKED,
            score: null,
            passed: null,
            attemptsCount: 0,
            lastSubmissionId: null,
            submittedAt: null,
            completedAt: null,
          },
          assignment: {
            status: ActivityProgressStatus.LOCKED,
            score: null,
            passed: null,
            attemptsCount: 0,
            lastSubmissionId: null,
            submittedAt: null,
            completedAt: null,
          },
          lessonStatus:
            index === 0
              ? ActivityProgressStatus.IN_PROGRESS
              : ActivityProgressStatus.LOCKED,
          fullyCompleted: false,
          unlockedAt: index === 0 ? new Date() : null,
          completedAt: null,
          schemaVersion: 2,
        }));

      progresses.push(progress);
    }

    let hasChanges = false;

    for (const [index, progress] of progresses.entries()) {
      const previousProgress = index > 0 ? progresses[index - 1] : null;
      const videoUnlocked =
        index === 0 ||
        previousProgress?.assignment.status === ActivityProgressStatus.COMPLETED;

      hasChanges =
        this.syncVideoActivity(progress.video, videoUnlocked) || hasChanges;
      hasChanges =
        this.syncQuizActivity(
          progress.quiz,
          progress.video.status === ActivityProgressStatus.COMPLETED,
        ) || hasChanges;
      hasChanges =
        this.syncAssignmentActivity(
          progress.assignment,
          progress.quiz.status === ActivityProgressStatus.COMPLETED &&
            progress.quiz.passed === true,
        ) || hasChanges;

      const fullyCompleted =
        progress.video.status === ActivityProgressStatus.COMPLETED &&
        progress.quiz.status === ActivityProgressStatus.COMPLETED &&
        progress.assignment.status === ActivityProgressStatus.COMPLETED;

      if (progress.fullyCompleted !== fullyCompleted) {
        progress.fullyCompleted = fullyCompleted;
        hasChanges = true;
      }

      const lessonStatus = !videoUnlocked
        ? ActivityProgressStatus.LOCKED
        : fullyCompleted
          ? ActivityProgressStatus.COMPLETED
          : ActivityProgressStatus.IN_PROGRESS;

      if (progress.lessonStatus !== lessonStatus) {
        progress.lessonStatus = lessonStatus;
        hasChanges = true;
      }

      if (videoUnlocked && !progress.unlockedAt) {
        progress.unlockedAt = new Date();
        hasChanges = true;
      }

      if (fullyCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await Promise.all(progresses.map((progress) => progress.save()));
    }

    return { lessons, progresses };
  }

  private syncVideoActivity(
    activity: VideoProgress,
    unlocked: boolean,
  ): boolean {
    let changed = false;
    const isCompleted =
      activity.status === ActivityProgressStatus.COMPLETED ||
      (activity.watchPercent ?? 0) >= 100;

    if (isCompleted) {
      if (activity.status !== ActivityProgressStatus.COMPLETED) {
        activity.status = ActivityProgressStatus.COMPLETED;
        changed = true;
      }
      if (!activity.completedAt) {
        activity.completedAt = new Date();
        changed = true;
      }
    } else if (unlocked) {
      if (activity.status === ActivityProgressStatus.LOCKED) {
        activity.status = ActivityProgressStatus.IN_PROGRESS;
        changed = true;
      }
      if (!activity.unlockedAt) {
        activity.unlockedAt = new Date();
        changed = true;
      }
    } else if (activity.status !== ActivityProgressStatus.LOCKED) {
      activity.status = ActivityProgressStatus.LOCKED;
      changed = true;
    }

    return changed;
  }

  private syncQuizActivity(activity: QuizProgress, unlocked: boolean): boolean {
    let changed = false;

    if (activity.status === ActivityProgressStatus.COMPLETED) {
      if (activity.passed !== true) {
        activity.passed = true;
        changed = true;
      }
      if (!activity.completedAt) {
        activity.completedAt = new Date();
        changed = true;
      }
      return changed;
    }

    if (unlocked) {
      if (activity.status === ActivityProgressStatus.LOCKED) {
        activity.status = ActivityProgressStatus.IN_PROGRESS;
        changed = true;
      }
    } else if (activity.status !== ActivityProgressStatus.LOCKED) {
      activity.status = ActivityProgressStatus.LOCKED;
      changed = true;
    }

    return changed;
  }

  private syncAssignmentActivity(
    activity: AssignmentProgress,
    unlocked: boolean,
  ): boolean {
    let changed = false;

    if (activity.status === ActivityProgressStatus.COMPLETED) {
      if (activity.passed !== true) {
        activity.passed = true;
        changed = true;
      }
      if (!activity.completedAt) {
        activity.completedAt = new Date();
        changed = true;
      }
      return changed;
    }

    if (unlocked) {
      if (activity.status === ActivityProgressStatus.LOCKED) {
        activity.status = ActivityProgressStatus.IN_PROGRESS;
        changed = true;
      }
    } else if (activity.status !== ActivityProgressStatus.LOCKED) {
      activity.status = ActivityProgressStatus.LOCKED;
      changed = true;
    }

    return changed;
  }

  private async ensureProgressDocument(
    userId: string,
    courseId: string,
    lesson: (Lesson & { _id?: Types.ObjectId | string }) | LessonDocument,
    lessonOrder: number,
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);
    const lessonObjectId = new Types.ObjectId(String((lesson as any)._id));

    let progress = await this.userLessonProgressModel
      .findOne({
        userId: userObjectId,
        courseId: courseObjectId,
        lessonId: lessonObjectId,
      })
      .exec();

    if (!progress) {
      progress = await this.userLessonProgressModel.create({
        userId: userObjectId,
        courseId: courseObjectId,
        lessonId: lessonObjectId,
        lessonOrder,
        video: {
          status:
            lessonOrder === 1
              ? ActivityProgressStatus.IN_PROGRESS
              : ActivityProgressStatus.LOCKED,
          watchPercent: 0,
          unlockedAt: lessonOrder === 1 ? new Date() : null,
          completedAt: null,
        },
        quiz: {
          status: ActivityProgressStatus.LOCKED,
          score: null,
          passed: null,
          attemptsCount: 0,
          lastSubmissionId: null,
          submittedAt: null,
          completedAt: null,
        },
        assignment: {
          status: ActivityProgressStatus.LOCKED,
          score: null,
          passed: null,
          attemptsCount: 0,
          lastSubmissionId: null,
          submittedAt: null,
          completedAt: null,
        },
        lessonStatus:
          lessonOrder === 1
            ? ActivityProgressStatus.IN_PROGRESS
            : ActivityProgressStatus.LOCKED,
        fullyCompleted: false,
        unlockedAt: lessonOrder === 1 ? new Date() : null,
        completedAt: null,
        schemaVersion: 2,
      });
    }

    return progress;
  }

  private async findLessonOrThrow(lessonId: string, courseId: string) {
    const lesson = await this.lessonModel
      .findOne({ _id: lessonId, course_id: courseId })
      .exec();

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  private buildActivityResponse(
    activity: VideoProgress | QuizProgress | AssignmentProgress,
    unlocked: boolean,
    lockedReason: string | null,
    message: string,
    extra: Record<string, unknown> = {},
  ) {
    return {
      status: activity.status,
      completed: activity.status === ActivityProgressStatus.COMPLETED,
      unlocked,
      lockedReason,
      message: unlocked ? null : message,
      completedAt: activity.completedAt,
      ...extra,
    };
  }

  private toObjectIdOrNull(value?: string | Types.ObjectId | null) {
    if (!value) return null;
    if (value instanceof Types.ObjectId) return value;
    return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
  }
}