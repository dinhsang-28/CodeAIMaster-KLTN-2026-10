import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Play, Lock } from "lucide-react";

interface LessonItem {
  id: number;
  title: string;
  path: string;
  type: string;
}

interface SidebarProps {
  data: LessonItem[];
}

type LessonStatus = "done" | "learning" | "locked";

const Sidebar = ({ data }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  // Load completed lessons từ localStorage
  useEffect(() => {
    const loadCompleted = () => {
      const saved = localStorage.getItem("completed_lessons");
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    };

    loadCompleted();

    // Nghe event khi hoàn thành bài
    window.addEventListener("lessonsUpdated", loadCompleted);
    return () => window.removeEventListener("lessonsUpdated", loadCompleted);
  }, []);

  const currentIndex = data.findIndex(
    (item) => item.path === location.pathname
  );

  // Tìm bài hoàn thành cao nhất
  const maxCompletedIndex = data.findIndex((item) => !completedLessons.includes(item.id));

  const completedCount = completedLessons.length;
  const progressPercent = data.length > 0 ? (completedCount / data.length) * 100 : 0;

  const getStatus = (index: number): LessonStatus => {
    const lessonId = data[index].id;
    if (index === currentIndex) return "learning";
    if (completedLessons.includes(lessonId)) return "done";
    return "locked";
  };

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "learning":
        return <Play size={16} className="text-brand-500 fill-brand-500" />;
      case "locked":
        return <Lock size={16} className="text-gray-300" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Nội dung khóa học
          </h2>
          <span className="inline-flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-600">
            {completedCount}/{data.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-400 to-brand-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedCount > 0 ? `Tiến độ: ${Math.round(progressPercent)}%` : "Bắt đầu học ngay"}
        </p>
      </div>

      {/* Lessons List */}
      <div className="p-5 space-y-2 max-h-96 overflow-y-auto">
        {data.map((item, index) => {
          const status = getStatus(index);
          const isActive = location.pathname === item.path;
          const isLocked = status === "locked" && index > maxCompletedIndex;

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && navigate(item.path)}
              disabled={isLocked}
              className={`w-full px-5 py-3.5 rounded-xl transition-all duration-200 flex items-start gap-3
                ${
                  isActive
                    ? "bg-brand-25 border border-brand-300 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent"
                }
                ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}
              `}
            >
              {/* Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(status)}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <div
                  className={`text-sm font-semibold transition-colors line-clamp-2
                    ${isActive ? "text-brand-700" : "text-gray-800"}
                  `}
                >
                  Bài {index + 1}: {item.title}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 mt-1">
                  {status === "learning" && (
                    <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full uppercase whitespace-nowrap">
                      Đang học
                    </span>
                  )}
                  {status === "done" && (
                    <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full uppercase whitespace-nowrap">
                      Hoàn thành
                    </span>
                  )}
                  {status === "locked" && (
                    <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full uppercase whitespace-nowrap">
                      Khoá
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;