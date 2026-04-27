import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LessonProgressStatus,
  UserLessonProgress,
  UserLessonProgressDocument,
} from './entities/user-lesson-progress.entity';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/entities/assignment.entity';
import {
  Submission,
  SubmissionDocument,
} from '../submissions/entities/submission.entity';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class UserLessonProgressService {
  constructor(
    @InjectModel(UserLessonProgress.name)
    private readonly userLessonProgressModel: Model<UserLessonProgressDocument>,
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async openLesson(userId: string, lessonId: string) {
    const lesson = await this.lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(String(lesson.course_id));
    const lessonObjectId = new Types.ObjectId(lessonId);

    const existing = await this.userLessonProgressModel
      .findOne({ userId: userObjectId, courseId: courseObjectId, lessonId: lessonObjectId })
      .exec();

    if (existing) {
      if (!existing.isCompleted && existing.status === LessonProgressStatus.NOT_STARTED) {
        existing.status = LessonProgressStatus.IN_PROGRESS;
        await existing.save();
      }
      return existing;
    }

    return this.userLessonProgressModel.create({
      userId: userObjectId,
      courseId: courseObjectId,
      lessonId: lessonObjectId,
      status: LessonProgressStatus.IN_PROGRESS,
      watchPercent: 0,
      isCompleted: false,
      completedAt: null,
    });
  }

  async updateVideoProgress(userId: string, lessonId: string, watchPercent: number) {
    const lesson = await this.lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const progress = await this.ensureProgress(userId, lessonId, String(lesson.course_id));
    const nextWatchPercent = Math.max(progress.watchPercent ?? 0, watchPercent);

    progress.watchPercent = Math.min(100, nextWatchPercent);

    if (!progress.isCompleted) {
      progress.status = LessonProgressStatus.IN_PROGRESS;
    }

    await this.applyCompletionState(progress, lesson, false);

    return progress.save();
  }

  async handleAssignmentGraded(
    userId: string,
    assignmentId: string,
    passed: boolean,
  ) {
    const assignment = await this.assignmentModel
      .findById(assignmentId)
      .lean()
      .exec();

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const lesson = await this.lessonModel
      .findById(assignment.lesson_id)
      .lean()
      .exec();

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const progress = await this.ensureProgress(userId, String(lesson._id), String(lesson.course_id));

    if (!progress.isCompleted) {
      progress.status = LessonProgressStatus.IN_PROGRESS;
    }

    await this.applyCompletionState(progress, lesson, passed);

    return progress.save();
  }

  private async ensureProgress(userId: string, lessonId: string, courseId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const lessonObjectId = new Types.ObjectId(lessonId);
    const courseObjectId = new Types.ObjectId(courseId);

    let progress = await this.userLessonProgressModel
      .findOne({ userId: userObjectId, courseId: courseObjectId, lessonId: lessonObjectId })
      .exec();

    if (!progress) {
      progress = await this.userLessonProgressModel.create({
        userId: userObjectId,
        courseId: courseObjectId,
        lessonId: lessonObjectId,
        status: LessonProgressStatus.IN_PROGRESS,
        watchPercent: 0,
        isCompleted: false,
        completedAt: null,
      });
    }

    return progress;
  }

  private async applyCompletionState(
    progress: UserLessonProgressDocument,
    lesson: Lesson & { _id: Types.ObjectId },
    assignmentPassedFromHook: boolean,
  ) {
    const hasVideo = Boolean(lesson.video_url);

    const assignments = await this.assignmentModel
      .find({ lesson_id: lesson._id })
      .select('_id')
      .lean()
      .exec();

    const hasAssignment = assignments.length > 0;

    let assignmentPassed = assignmentPassedFromHook;

    if (!assignmentPassed && hasAssignment) {
      const assignmentIds = assignments.map((item) => item._id);
      const acceptedSubmission = await this.submissionModel
        .findOne({
          user_id: progress.userId,
          assignment_id: { $in: assignmentIds },
          status: 'ACCEPTED',
        })
        .select('_id')
        .lean()
        .exec();

      assignmentPassed = Boolean(acceptedSubmission);
    }

    let shouldComplete = false;

    if (hasVideo && !hasAssignment) {
      shouldComplete = progress.watchPercent >= 80;
    } else if (!hasVideo && hasAssignment) {
      shouldComplete = assignmentPassed;
    } else if (hasVideo && hasAssignment) {
      shouldComplete = progress.watchPercent >= 80 && assignmentPassed;
    }

    const wasCompleted = progress.isCompleted;

    if (!wasCompleted && shouldComplete) {
      progress.isCompleted = true;
      progress.status = LessonProgressStatus.COMPLETED;
      progress.completedAt = new Date();
      await this.progressService.recalculate(
        String(progress.userId),
        String(progress.courseId),
      );
    }
  }
}
