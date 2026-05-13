import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  getQuestionsByQuizId,
  getQuizzesByAssignmentId,
  submitLessonQuiz,
  submitQuiz,
} from "../../api/quizz";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: number[];
  type: "single" | "multiple";
};

type QuizzProps = {
  courseId?: string;
  lessonId?: string;
  assignment?: any;
  nextPath?: string;
  onComplete?: (payload?: {
    lessonId: string;
    activityType: "quiz";
    completed: boolean;
    passed?: boolean;
    score?: number | null;
    submittedAt?: string;
    completedAt?: string;
  }) => Promise<void> | void;
};

const normalizeQuestion = (question: any): QuizQuestion => {
  const options = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ].filter(Boolean);

  return {
    id: question._id || question.id,
    question: question.question_text || question.text || "",
    options,
    correct: [],
    type: "single",
  };
};

const Quizz = ({
  courseId,
  lessonId,
  assignment,
  nextPath,
  onComplete,
}: QuizzProps) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[][]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState("");
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  const resolvedQuizTitle = useMemo(() => {
    return assignment?.title || assignment?.name || "Kiểm tra kiến thức";
  }, [assignment]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId, assignment?._id, assignment?.assignmentId]);

  useEffect(() => {
    const loadQuestions = async () => {
      const assignmentId = assignment?.assignmentId || assignment?._id;
      if (!assignmentId) {
        setQuizId("");
        setQuestions([]);
        return;
      }

      setFetchingQuestions(true);
      setValidationError("");

      try {
        let resolvedQuizId =
          assignment?.quizzes?.[0]?._id || assignment?.quiz?._id || "";

        if (!resolvedQuizId) {
          const quizzes = await getQuizzesByAssignmentId(assignmentId);
          const quizList = Array.isArray(quizzes)
            ? quizzes
            : quizzes?.data || quizzes?.results || [];
          resolvedQuizId = quizList?.[0]?._id || "";
        }

        setQuizId(resolvedQuizId);

        if (assignment?.quizzes?.[0]?.questions?.length) {
          setQuestions(assignment.quizzes[0].questions.map(normalizeQuestion));
          return;
        }

        if (!resolvedQuizId) {
          setQuestions([]);
          return;
        }

        const questionsRes = await getQuestionsByQuizId(resolvedQuizId);
        const normalizedQuestions = Array.isArray(questionsRes)
          ? questionsRes
          : questionsRes?.data || questionsRes?.results || [];

        setQuestions(normalizedQuestions.map(normalizeQuestion));
      } catch (error: any) {
        setQuestions([]);
        setValidationError(
          error?.message || "Không thể tải câu hỏi cho quiz này.",
        );
      } finally {
        setFetchingQuestions(false);
      }
    };

    loadQuestions();
  }, [assignment]);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = [optionIndex];
      return next;
    });
  };

  const handleSubmit = async () => {
    const unanswered = questions.findIndex(
      (_, index) => !answers[index] || answers[index].length === 0,
    );

    if (unanswered !== -1) {
      setValidationError(
        `Vui lòng trả lời tất cả các câu hỏi (từ câu ${unanswered + 1})`,
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationError("");
    setLoading(true);

    try {
      const formattedAnswers = questions.map((question, index) => ({
        question_id: question.id,
        selected_answer: answers[index].map((item) => String(item)),
      }));

      let res: any;

      if (courseId && lessonId) {
        try {
          res = await submitLessonQuiz(courseId, lessonId, formattedAnswers);
        } catch (error: any) {
          if (error?.response?.status !== 404 || !quizId) {
            throw error;
          }

          res = await submitQuiz(quizId, formattedAnswers);
        }
      } else if (quizId) {
        res = await submitQuiz(quizId, formattedAnswers);
      } else {
        throw new Error("Không tìm thấy quiz để nộp bài.");
      }

      const finalScore = Number(res?.correctCount ?? res?.score ?? 0);
      const normalizedScore = Number(res?.score ?? finalScore);
      const totalQuestions = Number(res?.totalQuestions ?? questions.length);
      const hasPassed =
        typeof res?.passed === "boolean"
          ? res.passed
          : totalQuestions > 0 && finalScore >= totalQuestions;

      setScore(finalScore);
      setPassed(hasPassed);
      setQuizResults(res?.results ?? []);
      setSubmitted(true);

      await onComplete?.({
        lessonId: lessonId || "",
        activityType: "quiz",
        completed: hasPassed,
        passed: hasPassed,
        score: normalizedScore,
      });
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Có lỗi xảy ra khi nộp bài quiz.";
      setValidationError(
        Array.isArray(serverMessage) ? serverMessage.join(", ") : serverMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || fetchingQuestions) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm md:p-8">
        Đang tải quiz...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <h1 className="mb-5 text-xl font-bold md:mb-6 md:text-2xl">
        Quiz: {resolvedQuizTitle}
      </h1>

      {validationError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 md:mb-6">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700">Không thể nộp bài</h3>
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          </div>
          <button
            onClick={() => setValidationError("")}
            className="shrink-0 font-bold text-red-600 hover:text-red-700"
          >
            x
          </button>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm md:p-8">
          Bài quiz này hiện chưa có câu hỏi nào.
        </div>
      ) : submitted ? (
        <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4 shadow-sm md:mb-8 md:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-brand-900">Kết quả Quiz</h2>
              <p className="mt-1 text-sm text-brand-600">
                Bạn đã hoàn thành bài kiểm tra này.{" "}
                {passed
                  ? "Chúc mừng bạn đã vượt qua!"
                  : "Hãy cố gắng hơn nữa ở lần sau."}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-sm md:px-6">
              <span className="text-3xl font-black text-brand-600">{score}</span>
              <span className="text-xl text-slate-300">/</span>
              <span className="text-xl font-bold text-slate-500">
                {questions.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-7 space-y-4 md:mb-8 md:space-y-6">
        {questions.map((question, qIndex) => {
          const hasAnswer = answers[qIndex] && answers[qIndex].length > 0;
          const resultObj = quizResults.find((r) => r.question_id === question.id);
          const isCorrect = submitted ? resultObj?.isCorrect : undefined;

          return (
            <div
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow md:p-6"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      Câu {qIndex + 1}/{questions.length}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-700 md:text-lg">
                    {question.question}
                  </h2>
                </div>

                {submitted && isCorrect && (
                  <CheckCircle2 size={24} className="shrink-0 text-green-500" />
                )}
                {submitted && !isCorrect && (
                  <XCircle size={24} className="shrink-0 text-red-500" />
                )}
                {!submitted && hasAnswer && (
                  <CheckCircle2 size={24} className="shrink-0 text-green-500" />
                )}
              </div>

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[qIndex]?.includes(optionIndex);

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => !submitted && handleSelect(qIndex, optionIndex)}
                      disabled={submitted}
                      className={`w-full rounded-xl border p-3 text-left transition-all md:p-4 ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${
                        selected
                          ? "border-brand-700 bg-brand-25 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            selected
                              ? "border-brand-500 bg-brand-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selected && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-700">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {submitted && !isCorrect && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">
                    <strong>Đáp án của bạn chưa chính xác.</strong> Vui lòng xem
                    lại bài giảng để tìm đáp án đúng.
                  </p>
                </div>
              )}

              {submitted && isCorrect && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-semibold text-green-700">
                    Đáp án chính xác! Bạn đã trả lời đúng câu hỏi này.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && questions.length > 0 && (
        <div className="sticky bottom-3 z-10 flex justify-center px-1 sm:bottom-6">
          <button
            onClick={handleSubmit}
            className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-700 sm:w-auto sm:px-8"
          >
            Nộp bài
          </button>
        </div>
      )}

      {submitted && (
        <div className="overflow-hidden rounded-3xl border-2 border-brand-400 bg-brand-50/50">
          <div className="bg-brand-25 px-4 py-6 text-center text-white sm:px-8 md:px-12 md:py-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/90">
              <div className="text-4xl">✓</div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-brand-700 md:text-3xl">
              Kết quả: {score}/{questions.length} câu đúng
            </h2>

            <p className="text-base text-brand-700">
              {passed
                ? "Bạn đã mở được bài code tiếp theo."
                : "Bạn chưa pass quiz này. Hãy thử lại để mở bài code."}
            </p>
          </div>

          <div className="bg-white px-4 py-6 text-center sm:px-8 md:px-12 md:py-8">
            <div className="mb-6 flex items-center justify-center gap-3">
              <CheckCircle2 size={28} className="shrink-0 text-brand-600" />
              <p className="text-lg font-semibold text-gray-800 md:text-xl">
                {passed
                  ? "Bạn đã hoàn thành bài quiz."
                  : "Bạn đã nộp bài quiz."}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              {passed && nextPath && (
                <button
                  onClick={() => navigate(nextPath)}
                  className="w-full rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700 sm:w-auto"
                >
                  Bài học tiếp theo
                </button>
              )}

              <button
                onClick={() => {
                  setAnswers([]);
                  setSubmitted(false);
                  setValidationError("");
                  setQuizResults([]);
                  setPassed(false);
                }}
                className="w-full rounded-full border border-brand-600 bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-brand-50 sm:w-auto"
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quizz;
