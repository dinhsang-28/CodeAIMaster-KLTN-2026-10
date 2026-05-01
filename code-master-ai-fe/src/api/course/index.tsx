import { axiosInstance } from "../../utils/axios";

type Category = {
  _id: string;
  category_name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type CategoryResponse = {
  results: Category[];
  totalPages: number;
};

export const GetCourses = async () => {
  try {
    const res = await axiosInstance.get('/courses');
    console.log("THANH CONG: ", res.data);
    return res.data;
  } catch (err) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};

export const GetCategories = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstance.get<CategoryResponse>('/category');
    console.log("THANH CONG:", res.data);
    return res.data.results;
  } catch (err) {
    console.log("THAT BAI:", err);
    throw err;
  }
};

export const GetCoursesDetail = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/courses/${id}`);
    console.log("THANH CONG: ", res.data);
    return res.data;
  } catch (err) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};

// --- NEW COURSE APIs ---
export const searchCourses = async (params?: { keyword?: string; level?: string; category?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number }) => {
  const res = await axiosInstance.get('/courses/search', { params });
  return res.data?.data || res.data;
};

export const getCourses = async () => {
  const res = await axiosInstance.get('/courses');
  return res.data?.data || res.data;
};

export const getCourseById = async (id: string) => {
  const res = await axiosInstance.get(`/courses/${id}`);
  return res.data?.data || res.data;
};

export const getCourseFullInfo = async (id: string) => {
  const res = await axiosInstance.get(`/courses/${id}/info`);
  return res.data?.data || res.data;
};

export const createCourse = async (data: FormData | object) => {
  const isFormData = data instanceof FormData;
  const res = await axiosInstance.post('/courses', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return res.data?.data || res.data;
};

export const updateCourse = async (id: string, data: FormData | object) => {
  const isFormData = data instanceof FormData;
  const res = await axiosInstance.patch(`/courses/${id}`, data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return res.data?.data || res.data;
};

export const deleteCourse = async (id: string) => {
  const res = await axiosInstance.delete(`/courses/${id}`);
  return res.data?.data || res.data;
};

// --- NEW LESSON APIs ---
export const getLessons = async () => {
  const res = await axiosInstance.get('/lessons');
  return res.data?.data || res.data;
};

export const getLessonById = async (id: string) => {
  const res = await axiosInstance.get(`/lessons/${id}`);
  return res.data?.data || res.data;
};

export const createLesson = async (data: any) => {
  const res = await axiosInstance.post('/lessons', data);
  return res.data?.data || res.data;
};

export const updateLesson = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/lessons/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteLesson = async (id: string) => {
  const res = await axiosInstance.delete(`/lessons/${id}`);
  return res.data?.data || res.data;
};