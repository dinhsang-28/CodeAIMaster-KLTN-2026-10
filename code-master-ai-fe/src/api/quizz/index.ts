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

export const getQuizzesByAssignmentId = async (assignmentId: string) => {
  const res = await axiosInstance.get(`/quizzes?assignment_id=${assignmentId}`);
  return normalizeResponse<any>(res);
};

export const getQuestionsByQuizId = async (quizId: string) => {
  const res = await axiosInstance.get(`/questions?quiz_id=${quizId}`);
  return normalizeResponse<any>(res);
};

export const submitQuiz = async (quizId: string, answers: any[]) => {
  const res = await axiosInstance.post('/submissions/quiz', {
    quiz_id: quizId,
    answers: answers
  });
  return res.data;
};

export const submitLessonQuiz = async (
  courseId: string,
  lessonId: string,
  answers: any[],
) => {
  const res = await axiosInstance.post(
    `/courses/${courseId}/lessons/${lessonId}/quiz/submit`,
    { answers },
  );
  return normalizeResponse<any>(res);
};
