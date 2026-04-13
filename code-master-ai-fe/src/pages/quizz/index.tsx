import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizData } from "./fakeData";
import { lessons } from "../lesson/fakeData";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const Quizz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<number[][]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = [optionIndex];
      return newAnswers;
    });
  };

  const calcScore = () => {
    let correct = 0;

    quizData.forEach((q, i) => {
      const userAns = answers[i] || [];

      if (
        userAns.length === q.correct.length &&
        userAns.every((a) => q.correct.includes(a))
      ) {
        correct++;
      }
    });

    return correct;
  };

  const handleSubmit = () => {
    // Validate - kiểm tra nếu tất cả câu hỏi có câu trar lời
    const unanswered = quizData.findIndex((_, i) => !answers[i] || answers[i].length === 0);

    if (unanswered !== -1) {
      setValidationError(`Vui lòng trả lời tất cả câu hỏi (từ câu ${unanswered + 1})`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationError("");
    const score = calcScore();
    completeQuiz(id!, score);
    setSubmitted(true);
  };

  const score = calcScore();

  const currentLessonIndex = lessons.findIndex(
    (l) => l.path === `/learn/quiz/${id}`,
  );

  const nextLesson = lessons[currentLessonIndex + 1];

  const completeQuiz = (quizId: string, finalScore: number) => {
    const saved = localStorage.getItem("completed_lessons");
    const completed = saved ? JSON.parse(saved) : [];

    const quizItem = lessons.find((l) => l.path === `/learn/quiz/${quizId}`);

    if (quizItem && !completed.includes(quizItem.id)) {
      completed.push(quizItem.id);
      localStorage.setItem("completed_lessons", JSON.stringify(completed));
      localStorage.setItem(`quiz_${quizId}_score`, String(finalScore));
      window.dispatchEvent(new Event("lessonsUpdated"));
    }

    console.log(`Đã hoàn thành quiz ${quizId} với điểm ${finalScore}/${quizData.length}`);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Quiz: Kiến thức ReactJS</h1>

      {/* VALIDATION ERROR */}
      {validationError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700">Chưa trả lời đủ câu</h3>
            <p className="text-sm text-red-600 mt-1">{validationError}</p>
          </div>
          <button
            onClick={() => setValidationError("")}
            className="text-red-600 hover:text-red-700 flex-shrink-0 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ALL QUESTIONS */}
      <div className="space-y-6 mb-8">
            {quizData.map((question, qIndex) => {
              const hasAnswer = answers[qIndex] && answers[qIndex].length > 0;
              const userAns = answers[qIndex] || [];
              const isCorrect =
                userAns.length === question.correct.length &&
                userAns.every((a) => question.correct.includes(a));

              return (
                <div key={question.id} className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                  {/* QUESTION HEADER */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                          Câu {qIndex + 1}/{quizData.length}
                        </span>
                        {question.type === "multiple" && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Chọn nhiều
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-600">
                        {question.question}
                      </h2>
                    </div>
                    {submitted && isCorrect && (
                      <CheckCircle2 size={24} className="text-green-500 flex-shrink-0 ml-2" />
                    )}
                    {submitted && !isCorrect && (
                      <XCircle size={24} className="text-red-500 flex-shrink-0 ml-2" />
                    )}
                    {!submitted && hasAnswer && (
                      <CheckCircle2 size={24} className="text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-2">
                    {question.options.map((opt, oIndex) => {
                      const selected = answers[qIndex]?.includes(oIndex);

                      return (
                        <button
                          key={oIndex}
                          onClick={() => !submitted && handleSelect(qIndex, oIndex)}
                          disabled={submitted}
                          className={`w-full text-left p-4 border rounded-xl transition-all ${
                            submitted ? "cursor-default" : "cursor-pointer"
                          }
                            ${
                              selected
                                ? "bg-brand-25 border-brand-700 shadow-sm"
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition relative
                                ${
                                  selected
                                    ? "bg-brand-500 border-brand-500"
                                    : "border-gray-300"
                                }`}
                            >
                              {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-gray-700 font-medium">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* FEEDBACK - CHỈ HIỂN THỊ KHI SAI */}
                  {submitted && !isCorrect && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 mb-2">
                        <strong>Đáp án đúng:</strong> {question.correct.map((idx) => question.options[idx]).join(", ")}
                      </p>
                    </div>
                  )}

                  {/* FEEDBACK - ĐÚNG */}
                  {submitted && isCorrect && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-700">
                        Đáp án chính xác
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SUBMIT BUTTON - CHỈ HI THỊ KHI CHƯA SUBMIT */}
          {!submitted && (
            <div className="flex justify-center gap-4 sticky bottom-6">
              <button
                onClick={handleSubmit}
                className="bg-brand-600 text-white px-8 py-3 rounded-full hover:bg-brand-700 font-semibold shadow-lg transition"
              >
                Nộp bài Quiz
              </button>
            </div>
          )}

      {/* RESULT - CHỈ HIỂN THỊ KHI SUBMIT */}
      {submitted && (
        <div className="rounded-3xl border-2 border-brand-400 overflow-hidden bg-brand-50/50">
          {/* TOP SECTION - SCORE RESULT */}
          <div className="bg-brand-25 px-12 py-8 text-center text-white">
            {/* TROPHY ICON */}
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-white/90">
              <div className="text-4xl">🏆</div>
            </div>

            {/* SCORE RESULT */}
            <h2 className="text-3xl font-bold text-brand-700 mb-2">
              Kết quả: {score}/{quizData.length} câu đúng
            </h2>

            {/* PERCENTAGE TEXT */}
            <p className="text-base text-brand-700">
              Bạn đã hoàn thành {Math.round((score / quizData.length) * 100)}% kiến thức chương này!
            </p>
          </div>

          {/* BOTTOM SECTION - CONGRATULATIONS + ACTION BUTTONS */}
          <div className="px-12 py-8 text-center bg-white">
            {/* CONGRATULATIONS MESSAGE */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle2 size={28} className="text-brand-600 flex-shrink-0" />
              <p className="text-xl font-semibold text-gray-800">
                Chúc mừng! Bạn đã hoàn thành bài Quiz.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-4">
              {nextLesson && (
                <button
                  onClick={() => {
                    navigate(nextLesson.path);
                  }}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-semibold transition"
                >
                  Bài học tiếp theo »
                </button>
              )}
              <button
                onClick={() => {
                  setAnswers([]);
                  setSubmitted(false);
                  setValidationError("");
                }}
                className="bg-white border border-brand-600 hover:bg-brand-50 text-brand-600 px-8 py-3 rounded-full font-semibold transition"
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Quizz;
