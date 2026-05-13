// import { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { lessons } from "./fakeData";

// type LessonPageProps = {
//   lessonData?: any;
//   nextPath?: string;
//   onComplete?: () => void;
// };

// const getYoutubeEmbedUrl = (url?: string) => {
//   if (!url) return "";

//   try {
//     const parsedUrl = new URL(url);
//     const hostname = parsedUrl.hostname.replace(/^www\./, "");

//     if (hostname === "youtu.be") {
//       const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
//       return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
//     }

//     if (hostname.includes("youtube.com")) {
//       const videoId = parsedUrl.searchParams.get("v");
//       if (videoId) {
//         return `https://www.youtube.com/embed/${videoId}`;
//       }

//       if (parsedUrl.pathname.startsWith("/embed/")) {
//         return url;
//       }
//     }
//   } catch {
//     return url.replace("watch?v=", "embed/");
//   }

//   return url;
// };

// const LessonPage = ({ lessonData, nextPath, onComplete }: LessonPageProps) => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [canProceed, setCanProceed] = useState(false);
//   const timerRef = useRef<number | null>(null);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     setCanProceed(false);
//     if (timerRef.current) window.clearTimeout(timerRef.current);
//     timerRef.current = window.setTimeout(() => setCanProceed(true), 4 * 60 * 1000);
//     return () => {
//       if (timerRef.current) window.clearTimeout(timerRef.current);
//     };
//   }, [id]);

//   const lesson = lessonData || lessons.find((l) => l.id === Number(id));

//   if (!lesson) {
//     return <div>Không có bài học</div>;
//   }

//   const currentIndex = lessons.findIndex((l) => l.id === Number(id));
//   const fallbackNextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
//   const resolvedNextPath = nextPath || fallbackNextLesson?.path;

//   const completeLesson = (lessonId: number) => {
//     if (onComplete) {
//       onComplete();
//       return;
//     }

//     const completionKey = `${lessonId}::video`;
//     const saved = localStorage.getItem("completed_lessons");
//     const completed = saved ? JSON.parse(saved) : [];

//     if (!completed.includes(completionKey)) {
//       completed.push(completionKey);
//       localStorage.setItem("completed_lessons", JSON.stringify(completed));
//       window.dispatchEvent(new Event("lessonsUpdated"));
//     }
//   };

//   return (
//     <>
//       <h1 className="mb-4 text-2xl font-bold">{lesson.title}</h1>

//       <p className="mb-6 text-gray-500">{lesson.description || lesson.content}</p>

//       <div className="whitespace-pre-line leading-relaxed text-gray-700">
//         {lesson.content || lesson.description || "Không có nội dung bài học."}
//       </div>

//       {lesson.video_url && (
//         <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
//           <iframe
//             src={getYoutubeEmbedUrl(lesson.video_url)}
//             title="Video bài học"
//             className="h-full w-full border-0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//             allowFullScreen
//           />
//         </div>
//       )}

//       <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-center">
//         <h3 className="mb-2 text-lg font-semibold text-brand-700">
//           Bạn đã hoàn thành bài học này?
//         </h3>

//         <p className="mb-6 text-sm text-brand-500">
//           Đánh dấu hoàn thành để tiếp tục học
//         </p>

//         <div className="flex justify-center gap-4">
//           <button
//             onClick={() => {
//               if (!canProceed) return;
//               completeLesson(lesson.id || 0);
//               if (resolvedNextPath) navigate(resolvedNextPath);
//             }}
//             disabled={!canProceed}
//             className={`rounded-full px-6 py-2 text-white transition ${
//               canProceed ? "bg-brand-500 hover:bg-brand-700" : "cursor-not-allowed bg-brand-300"
//             }`}
//           >
//             {canProceed ? "Hoàn thành" : "Xem đủ 4 phút để tiếp tục"}
//           </button>

//           {resolvedNextPath && (
//             <button
//               onClick={() => {
//                 if (!canProceed) return;
//                 navigate(resolvedNextPath);
//               }}
//               disabled={!canProceed}
//               className={`rounded-full border px-6 py-2 transition ${
//                 canProceed ? "hover:bg-gray-100" : "cursor-not-allowed opacity-60"
//               }`}
//             >
//               Bài tiếp
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default LessonPage;

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessons } from "./fakeData";
// Import API call của bạn (đường dẫn có thể khác tùy cấu trúc thư mục của bạn)
import { updateVideoProgress } from "../../api/userLessonProgress"; 

type LessonPageProps = {
  lessonData?: any;
  nextPath?: string;
  onComplete?: () => void;
};

const getYoutubeEmbedUrl = (url?: string) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }
    }
  } catch {
    return url.replace("watch?v=", "embed/");
  }

  return url;
};

const LessonPage = ({ lessonData, nextPath, onComplete }: LessonPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canProceed, setCanProceed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Thêm state loading khi đang call API
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCanProceed(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    // Giữ nguyên logic đếm giờ 4 phút (hoặc bạn có thể chỉnh ngắn lại để test)
    timerRef.current = window.setTimeout(() => setCanProceed(true), 4 * 60 * 1000); 
    
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [id]);

  const lesson = lessonData || lessons.find((l) => l.id === Number(id));

  if (!lesson) {
    return <div>Không có bài học</div>;
  }

  const currentIndex = lessons.findIndex((l) => l.id === Number(id));
  const fallbackNextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
  const resolvedNextPath = nextPath || fallbackNextLesson?.path;

  // Cập nhật hàm này để gọi API thay vì dùng localStorage
  const completeLesson = async () => {
    // Ưu tiên dùng _id từ MongoDB (lessonData._id)
    const targetLessonId = lessonData?._id || lesson.id; 

    if (!targetLessonId) return;

    try {
      setIsUpdating(true);
      
      // Gọi API cập nhật tiến trình thành 100% (Backend sẽ tự mark isCompleted = true)
      await updateVideoProgress({
        lessonId: targetLessonId.toString(),
        watchPercent: 100, 
      });

      // Kích hoạt hàm onComplete để Layout cha (LearnLayout) tải lại dữ liệu sidebar và đánh dấu tích xanh
      if (onComplete) {
        onComplete();
      } else {
        // Fallback event cho các trường hợp không có onComplete
        window.dispatchEvent(new Event("lessonsUpdated"));
      }
    } catch (error) {
      console.error("Lỗi khi lưu tiến độ bài học:", error);
      alert("Không thể lưu tiến độ học. Vui lòng thử lại!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{lesson.title}</h1>

      <p className="mb-6 text-gray-500">{lesson.description || lesson.content}</p>

      <div className="whitespace-pre-line leading-relaxed text-gray-700">
        {lesson.content || lesson.description || "Không có nội dung bài học."}
      </div>

      {lesson.video_url && (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
          <iframe
            src={getYoutubeEmbedUrl(lesson.video_url)}
            title="Video bài học"
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-brand-700">
          Bạn đã hoàn thành bài học này?
        </h3>

        <p className="mb-6 text-sm text-brand-500">
          Đánh dấu hoàn thành để tiếp tục học
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={async () => {
              if (!canProceed || isUpdating) return;
              await completeLesson(); // Gọi API lưu DB
              if (resolvedNextPath) navigate(resolvedNextPath); // Chuyển bài sau khi lưu xong
            }}
            disabled={!canProceed || isUpdating}
            className={`rounded-full px-6 py-2 text-white transition ${
              canProceed && !isUpdating 
                ? "bg-brand-500 hover:bg-brand-700" 
                : "cursor-not-allowed bg-brand-300"
            }`}
          >
            {isUpdating ? "Đang lưu..." : (canProceed ? "Hoàn thành" : "Xem đủ 4 phút để tiếp tục")}
          </button>

          {resolvedNextPath && (
            <button
              onClick={() => {
                if (!canProceed) return;
                navigate(resolvedNextPath);
              }}
              disabled={!canProceed || isUpdating}
              className={`rounded-full border px-6 py-2 transition ${
                canProceed ? "hover:bg-gray-100" : "cursor-not-allowed opacity-60"
              }`}
            >
              Bài tiếp
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LessonPage;