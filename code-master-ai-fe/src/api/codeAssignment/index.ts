import { axiosInstance } from "../../utils/axios";
import { AxiosResponse } from "axios";

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

export const getCodeAssignments = async (assignmentId: string) => {
  const res = await axiosInstance.get(`/code-assignments?assignment_id=${assignmentId}`);
  return normalizeResponse<any[]>(res);
};

export const getTestcases = async (codeAssignmentId: string) => {
  const res = await axiosInstance.get(`/testcases?code_assignment_id=${codeAssignmentId}`);
  return normalizeResponse<any[]>(res);
};

export const getPublicTestcases = async (codeAssignmentId: string) => {
  const res = await axiosInstance.get(`/testcases/public?code_assignment_id=${codeAssignmentId}`);
  return normalizeResponse<any[]>(res);
};

export const getAssignmentsByLessonId = async (lessonId: string) => {
  const res = await axiosInstance.get(`/assignments/search?lesson_id=${lessonId}`);
  return normalizeResponse<any[]>(res);
};
