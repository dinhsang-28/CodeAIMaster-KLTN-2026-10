import { axiosInstance } from "../../utils/axios";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  thumbnail: string;
  status: string;
  category: {
    _id: string;
    category_name: string;
  };
}

export interface ICourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface ICourseWithProgress extends ICourse {
  progress?: ICourseProgress;
}

export const getMyCourses = async () => {
  const res = await axiosInstance.get("/courses/myCourses");
  return res.data?.data || res.data;
};

export const getCourseProgress = async (courseId: string) => {
  const res = await axiosInstance.get(`/progress/course/${courseId}`);
  return res.data?.data || res.data;
};