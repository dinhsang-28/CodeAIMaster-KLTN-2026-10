import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  getQuizzesByAssignmentId,
  getQuestionsByQuizId,
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
  assignment?: any;
  nextPath?: string;
  onComplete?: (score: number) => void;
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

const Quizz = ({ assignment, nextPath, onComplete }: QuizzProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[][]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState<string>("");
  const [score, setScore] = useState(0);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, assignment?._id]);

  useEffect(() => {
    const loadQuestions = async () => {
      const assignmentId = assignment?._id || id;
      if (!assignmentId) {
        setQuizId("");
        setQuestions([]);
        return;
      }

      setFetchingQuestions(true);
      setValidationError("");

      try {
        let resolvedQuizId = assignment?.quizzes?.[0]?._id || assignment?.quiz?._id || "";

        if (!resolvedQuizId) {
          const quizzes = await getQuizzesByAssignmentId(assignmentId);
          resolvedQuizId = quizzes?.[0]?._id || quizzes?.data?.[0]?._id || "";
        }

        setQuizId(resolvedQuizId);

        if (!resolvedQuizId) {
          setQuestions([]);
          return;
        }

        if (assignment?.quizzes?.[0]?.questions?.length) {
          setQuestions(assignment.quizzes[0].questions.map(normalizeQuestion));
          return;
        }

        const questionsRes = await getQuestionsByQuizId(resolvedQuizId);
        const normalizedQuestions = Array.isArray(questionsRes)
          ? questionsRes
          : questionsRes?.data || questionsRes?.results || [];

        setQuestions(normalizedQuestions.map(normalizeQuestion));
      } catch (error: any) {
        setQuestions([]);
        setValidationError(error?.message || "Không thể tải danh sách câu hỏi");
      } finally {
        setFetchingQuestions(false);
      }
    };

    loadQuestions();
  }, [assignment, id]);

  const resolvedNextPath = nextPath;

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = [optionIndex];
      return newAnswers;
    });
  };

  const completeQuiz = (quizIdValue: string, finalScore: number) => {
    if (onComplete) {
      onComplete(finalScore);
      return;
    }

    const lessonKey = `${id || assignment?._id}::quiz`;
    const saved = localStorage.getItem("completed_lessons");
    const completed = saved ? JSON.parse(saved) : [];

    if (!completed.includes(lessonKey)) {
      completed.push(lessonKey);
      localStorage.setItem("completed_lessons", JSON.stringify(completed));
      localStorage.setItem(`quiz_${quizIdValue}_score`, String(finalScore));
      window.dispatchEvent(new Event("lessonsUpdated"));
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.findIndex((_, i) => !answers[i] || answers[i].length === 0);

    if (unanswered !== -1) {
      setValidationError(`Vui lòng trả lời tất cả câu hỏi (từ câu ${unanswered + 1})`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationError("");
    setLoading(true);

    try {
      const formatAnswers = questions.map((q, i) => ({
        question_id: q.id,
        selected_answer: answers[i].map((idx) => String(idx)),
      }));

      const res = await submitQuiz(quizId, formatAnswers);
      setScore(res.correctCount ?? res.score ?? 0);
      setQuizResults(res.results ?? []);
      completeQuiz(quizId || id || assignment?._id || "quiz", res.score ?? res.correctCount ?? 0);
      setSubmitted(true);
    } catch (err: any) {
      setValidationError(err.message || "Có lỗi xảy ra khi nộp bài");
    } finally {
      setLoading(false);
    }
  };

  if (loading || fetchingQuestions) {
    return <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Đang tải quiz...</div>;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">
        Quiz: {assignment?.title || assignment?.name || "Kiểm tra kiến thức"}
      </h1>

      {validationError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700">Chưa trả lời đủ câu</h3>
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
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          Bài quiz này hiện chưa có câu hỏi nào.
        </div>
      ) : submitted ? (
        <div className="mb-8 rounded-2xl border border-brand-100 bg-brand-50 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-brand-900">Ket qua Quiz</h2>
              <p className="mt-1 text-sm text-brand-600">Ban da hoan thanh bai kiem tra nay</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-3 shadow-sm">
              <span className="text-3xl font-black text-brand-600">{score}</span>
              <span className="text-xl text-slate-300">/</span>
              <span className="text-xl font-bold text-slate-500">{questions.length}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-8 space-y-6">
        {questions.map((question, qIndex) => {
          const hasAnswer = answers[qIndex] && answers[qIndex].length > 0;
          const resultObj = quizResults.find((r) => r.question_id === question.id);
          const isCorrect = submitted ? resultObj?.isCorrect : undefined;

          return (
            <div key={question.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      Cau {qIndex + 1}/{questions.length}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-600">
                    {question.question}
                  </h2>
                </div>
                {submitted && isCorrect && (
                  <CheckCircle2 size={24} className="ml-2 shrink-0 text-green-500" />
                )}
                {submitted && !isCorrect && (
                  <XCircle size={24} className="ml-2 shrink-0 text-red-500" />
                )}
                {!submitted && hasAnswer && (
                  <CheckCircle2 size={24} className="ml-2 shrink-0 text-green-500" />
                )}
              </div>

              <div className="space-y-2">
                {question.options.map((opt, oIndex) => {
                  const selected = answers[qIndex]?.includes(oIndex);

                  return (
                    <button
                      key={oIndex}
                      onClick={() => !submitted && handleSelect(qIndex, oIndex)}
                      disabled={submitted}
                      className={`w-full rounded-xl border p-4 text-left transition-all ${
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
                            selected ? "border-brand-500 bg-brand-500" : "border-gray-300"
                          }`}
                        >
                          {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium text-gray-700">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {submitted && !isCorrect && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">
                    <strong>Đáp án của bạn chưa chính xác.</strong> Vui lòng xem lại bài giảng để tìm đáp án đúng.
                  </p>
                </div>
              )}

              {submitted && isCorrect && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-semibold text-green-700">
                    Dap an chinh xac
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && questions.length > 0 && (
        <div className="sticky bottom-6 flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-700"
          >
            Nop bai quiz
          </button>
        </div>
      )}

      {submitted && (
        <div className="overflow-hidden rounded-3xl border-2 border-brand-400 bg-brand-50/50">
          <div className="bg-brand-25 px-12 py-8 text-center text-white">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/90">
              <div className="text-4xl">✓</div>
            </div>

            <h2 className="mb-2 text-3xl font-bold text-brand-700">
              Ket qua: {score}/{questions.length} cau dung
            </h2>

            <p className="text-base text-brand-700">
              Ban da hoan thanh {questions.length ? Math.round((score / questions.length) * 100) : 0}% kien thuc chuong nay
            </p>
          </div>

          <div className="bg-white px-12 py-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <CheckCircle2 size={28} className="shrink-0 text-brand-600" />
              <p className="text-xl font-semibold text-gray-800">
                Ban da hoan thanh bai quiz.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {resolvedNextPath && (
                <button
                  onClick={() => {
                    navigate(resolvedNextPath);
                  }}
                  className="rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700"
                >
                  Bai hoc tiep theo
                </button>
              )}
              <button
                onClick={() => {
                  setAnswers([]);
                  setSubmitted(false);
                  setValidationError("");
                }}
                className="rounded-full border border-brand-600 bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Lam lai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Quizz;
