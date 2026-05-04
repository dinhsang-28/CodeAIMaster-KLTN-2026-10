import { axiosInstance } from "../../utils/axios";
import { AxiosResponse } from "axios";

export type LessonProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserLessonProgress {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  status: LessonProgressStatus;
  watchPercent: number;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
}

// Normalizer helper function
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
  lessonId: string
): Promise<UserLessonProgress> => {
  const res = await axiosInstance.post(`/user-lesson-progress/open/${lessonId}`);
  return normalizeResponse<UserLessonProgress>(res);
};

export const updateVideoProgress = async (data: {
  lessonId: string;
  watchPercent: number;
}): Promise<UserLessonProgress> => {
  // Clamp watchPercent between 0 and 100 and handle NaN
  let watchPercent = data.watchPercent;
  if (isNaN(watchPercent)) {
    watchPercent = 0;
  }
  watchPercent = Math.max(0, Math.min(100, Math.round(watchPercent)));

  const res = await axiosInstance.patch(`/user-lesson-progress/video`, {
    lessonId: data.lessonId,
    watchPercent,
  });
  return normalizeResponse<UserLessonProgress>(res);
};
