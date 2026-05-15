import { AxiosResponse } from "axios";
import { axiosInstance } from "../../utils/axios";

export type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ActivityStatus = "LOCKED" | "IN_PROGRESS" | "COMPLETED";

export interface UserLessonProgress {
  _id?: string;
  userId: string;
  courseId: string;
  lessonId: string;
  status: LessonProgressStatus;
  watchPercent: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt?: string;
}

export interface ActivityProgressView {
  status: ActivityStatus;
  completed: boolean;
  unlocked: boolean;
  lockedReason?: string | null;
  message?: string | null;
  completedAt?: string | null;
  watchPercent?: number;
  passed?: boolean | null;
  score?: number | null;
  submittedAt?: string | null;
  attemptsCount?: number;
}

export interface CourseProgressLesson {
  lessonId: string;
  title: string;
  lessonOrder: number;
  lessonStatus: ActivityStatus;
  fullyCompleted: boolean;
  unlocked: boolean;
  lockedReason?: string | null;
  video: ActivityProgressView;
  quiz: ActivityProgressView;
  assignment: ActivityProgressView;
  legacyProgress?: {
    isCompleted: boolean;
    watchPercent: number;
  };
}

export interface CourseProgressDetail {
  courseId: string;
  userId: string;
  totalActivities: number;
  completedActivities: number;
  progressPercent: number;
  lessons: CourseProgressLesson[];
}

export interface LessonAccessDetail {
  courseId: string;
  lessonId: string;
  fullyCompleted: boolean;
  lessonStatus: ActivityStatus;
  video: ActivityProgressView;
  quiz: ActivityProgressView;
  assignment: ActivityProgressView;
}

const normalizeResponse = <T>(res: AxiosResponse<any>): T => {
  if (res.data?.data) {
    return res.data.data;
  }
  if (res.data?.results) {
    return res.data.results;
  }
  return res.data as T;
};

export const openLessonProgress = async (
  lessonId: string,
): Promise<UserLessonProgress> => {
  const res = await axiosInstance.post(`/user-lesson-progress/open/${lessonId}`);
  return normalizeResponse<UserLessonProgress>(res);
};

export const getCourseProgress = async (
  courseId: string,
): Promise<CourseProgressDetail> => {
  const res = await axiosInstance.get(`/courses/${courseId}/progress`);
  return normalizeResponse<CourseProgressDetail>(res);
};

export const getLessonAccess = async (
  courseId: string,
  lessonId: string,
): Promise<LessonAccessDetail> => {
  const res = await axiosInstance.get(
    `/courses/${courseId}/lessons/${lessonId}/access`,
  );
  return normalizeResponse<LessonAccessDetail>(res);
};

export const updateVideoProgress = async (data: {
  courseId?: string;
  lessonId: string;
  watchPercent: number;
}): Promise<any> => {
  let watchPercent = data.watchPercent;
  if (Number.isNaN(watchPercent)) {
    watchPercent = 0;
  }
  watchPercent = Math.max(0, Math.min(100, Math.round(watchPercent)));

  if (data.courseId) {
    const res = await axiosInstance.patch(
      `/courses/${data.courseId}/lessons/${data.lessonId}/video-progress`,
      { watchPercent },
    );
    return normalizeResponse<any>(res);
  }

  const res = await axiosInstance.patch(`/user-lesson-progress/video`, {
    lessonId: data.lessonId,
    watchPercent,
  });
  return normalizeResponse<UserLessonProgress>(res);
};
