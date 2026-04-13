import { useParams, useNavigate } from "react-router-dom";
import { lessons } from "./fakeData";

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const lesson = lessons.find((l) => l.id === Number(id));

  if (!lesson || lesson.type !== "lesson") {
    return <div>Không có bài học</div>;
  }

  const currentIndex = lessons.findIndex((l) => l.id === Number(id));
  const nextLesson = lessons[currentIndex + 1];

  const completeLesson = (lessonId: number) => {
    // Lấy danh sách bài hoàn thành
    const saved = localStorage.getItem("completed_lessons");
    const completed = saved ? JSON.parse(saved) : [];

    // Thêm ID nếu chưa có
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      localStorage.setItem("completed_lessons", JSON.stringify(completed));
      
      window.dispatchEvent(new Event("lessonsUpdated"));
    }

    console.log(`Đã hoàn thành bài học ${lessonId}`);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>

      <p className="text-gray-500 mb-6">{lesson.description}</p>

      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {lesson.content}
      </div>

      {/* COMPLETE */}
      <div className="mt-10 bg-brand-50 rounded-2xl p-6 text-center">
        <h3 className="font-semibold text-lg mb-2 text-brand-700">
          Bạn đã hoàn thành bài học này?
        </h3>

        <p className="text-brand-500 mb-6 text-sm">
          Đánh dấu hoàn thành để tiếp tục học
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              completeLesson(lesson.id);
              if (nextLesson) navigate(nextLesson.path);
            }}
            className="bg-brand-500 text-white px-6 py-2 rounded-full hover:bg-brand-700"
          >
            ✔ Hoàn thành
          </button>

          {nextLesson && (
            <button
              onClick={() => navigate(nextLesson.path)}
              className="border px-6 py-2 rounded-full hover:bg-gray-100"
            >
              Bài tiếp →
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LessonPage;
