import { axiosInstance } from "../../utils/axios";

// --- EXISTING TYPES ---
export interface SubmitCodePayload {
  assignmentId: string;
  language: string;
  sourceCode: string;
}

export interface SubmissionResult {
  message: string;
  submission: {
    _id: string;
    user_id: string;
    assignment_id: string;
    language: string;
    code: string;
    status: string;
    score: number;
    ai_hint: string | null;
  };
  passedCases: number;
  totalCases: number;
  compileError: string | null;
}

export interface ExerciseData {
  _id: string;
  title: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  description: string;
  requirements: string[];
  examples: { input: string; output: string }[];
  note?: string;
  default_code?: Record<string, string>;
}

// --- EXISTING API FUNCTIONS ---
/** Lấy thông tin đề bài theo assignmentId */
export const getExerciseById = async (assignmentId: string): Promise<ExerciseData> => {
  const res = await axiosInstance.get(`/exercises/${assignmentId}`);
  return res.data?.data || res.data;
};

/** Nộp bài và chấm điểm */
export const submitCode = async (payload: SubmitCodePayload): Promise<SubmissionResult> => {
  const res = await axiosInstance.post("/submissions/submit", payload);
  return res.data?.data || res.data;
};

// --- NEW ASSIGNMENT APIs ---
export const searchAssignments = async (params?: { keyword?: string; lesson_id?: string; type?: string; page?: number; limit?: number }) => {
  const res = await axiosInstance.get('/assignments/search', { params });
  return res.data?.data || res.data;
};

export const getAssignments = async () => {
  const res = await axiosInstance.get('/assignments');
  return res.data?.data || res.data;
};

export const getAssignmentById = async (id: string) => {
  const res = await axiosInstance.get(`/assignments/${id}`);
  return res.data?.data || res.data;
};

export const createAssignment = async (data: any) => {
  const res = await axiosInstance.post('/assignments', data);
  return res.data?.data || res.data;
};

export const updateAssignment = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/assignments/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteAssignment = async (id: string) => {
  const res = await axiosInstance.delete(`/assignments/${id}`);
  return res.data?.data || res.data;
};

// --- NEW QUIZ APIs ---
export const getQuizzesByAssignmentId = async (assignmentId: string) => {
  const res = await axiosInstance.get('/quizzes', { params: { assignment_id: assignmentId } });
  return res.data?.data || res.data;
};

export const getQuizById = async (id: string) => {
  const res = await axiosInstance.get(`/quizzes/${id}`);
  return res.data?.data || res.data;
};

export const createQuiz = async (data: any) => {
  const res = await axiosInstance.post('/quizzes', data);
  return res.data?.data || res.data;
};

export const updateQuiz = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/quizzes/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteQuiz = async (id: string) => {
  const res = await axiosInstance.delete(`/quizzes/${id}`);
  return res.data?.data || res.data;
};

// --- NEW QUESTION APIs ---
export const getQuestionsByQuizId = async (quizId: string) => {
  const res = await axiosInstance.get('/questions', { params: { quiz_id: quizId } });
  return res.data?.data || res.data;
};

export const getQuestionById = async (id: string) => {
  const res = await axiosInstance.get(`/questions/${id}`);
  return res.data?.data || res.data;
};

export const createQuestion = async (data: any) => {
  const res = await axiosInstance.post('/questions', data);
  return res.data?.data || res.data;
};

export const updateQuestion = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/questions/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteQuestion = async (id: string) => {
  const res = await axiosInstance.delete(`/questions/${id}`);
  return res.data?.data || res.data;
};

// --- NEW CODE ASSIGNMENT APIs ---
export const getCodeAssignmentsByAssignmentId = async (assignmentId: string) => {
  const res = await axiosInstance.get('/code-assignments', { params: { assignment_id: assignmentId } });
  return res.data?.data || res.data;
};

export const getCodeAssignmentById = async (id: string) => {
  const res = await axiosInstance.get(`/code-assignments/${id}`);
  return res.data?.data || res.data;
};

export const createCodeAssignment = async (data: any) => {
  const res = await axiosInstance.post('/code-assignments', data);
  return res.data?.data || res.data;
};

export const updateCodeAssignment = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/code-assignments/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteCodeAssignment = async (id: string) => {
  const res = await axiosInstance.delete(`/code-assignments/${id}`);
  return res.data?.data || res.data;
};

// --- NEW TESTCASE APIs ---
export const getTestcasesByCodeAssignmentId = async (codeAssignmentId: string) => {
  const res = await axiosInstance.get('/testcases', { params: { code_assignment_id: codeAssignmentId } });
  return res.data?.data || res.data;
};

export const getTestcaseById = async (id: string) => {
  const res = await axiosInstance.get(`/testcases/${id}`);
  return res.data?.data || res.data;
};

export const updateTestcase = async (id: string, data: any) => {
  const res = await axiosInstance.patch(`/testcases/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteTestcase = async (id: string) => {
  const res = await axiosInstance.delete(`/testcases/${id}`);
  return res.data?.data || res.data;
};

export const generateTestcasesByAI = async (assignmentId: string, data?: any) => {
  const res = await axiosInstance.post(`/testcases/generate-ai/${assignmentId}`, data);
  return res.data?.data || res.data;
};