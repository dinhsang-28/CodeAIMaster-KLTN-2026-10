import { create } from 'zustand';
import { ICourse } from '../../pages/course';

interface CourseState {
  globalCourses: ICourse[];
  setGlobalCourses: (courses: ICourse[]) => void;
  globalSearchKeyword: string;
  setGlobalSearchKeyword: (keyword: string) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  globalCourses: [],
  setGlobalCourses: (courses) => set({ globalCourses: courses }),
  globalSearchKeyword: "",
  setGlobalSearchKeyword: (globalSearchKeyword) => set({ globalSearchKeyword }),
}));
