import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Play, Lock, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const loadCompleted = () => {
      const saved = localStorage.getItem("completed_lessons");
      if (saved) setCompletedLessons(JSON.parse(saved));
    };

    loadCompleted();
    window.addEventListener("lessonsUpdated", loadCompleted);
    return () => window.removeEventListener("lessonsUpdated", loadCompleted);
  }, []);

  const currentIndex = data.findIndex(
    (item) => item.path === location.pathname
  );

  const completedCount = completedLessons.length;
  const progressPercent =
    data.length > 0 ? (completedCount / data.length) * 100 : 0;

  const getStatus = (index: number): LessonStatus => {
    const lessonId = data[index].id;

    if (index === currentIndex) return "learning";
    if (completedLessons.includes(lessonId)) return "done";
    if (index === completedCount) return "learning";

    return "locked";
  };

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={18} className="text-brand-600" />;
      case "learning":
        return <Play size={18} className="text-brand-600 fill-brand-600" />;
      case "locked":
        return <Lock size={18} className="text-gray-300" />;
    }
  };

  return (
    <div
      className={`h-screen sticky top-0 bg-white border-r transition-all duration-300 flex flex-col
      ${collapsed ? "w-[80px]" : "w-[300px]"}
      `}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-sm font-bold text-brand-700 uppercase">
            NỘI DUNG KHÓA HỌC
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* PROGRESS */}
      {!collapsed && (
        <div className="px-4 py-3 border-b">
          <div className="flex justify-between text-xs mb-2">
            <span>{completedCount}/{data.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-brand-500 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {data.map((item, index) => {
          const status = getStatus(index);
          const isActive = location.pathname === item.path;
          const isLocked = status === "locked";

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && navigate(item.path)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition
                ${collapsed ? "justify-center" : ""}
                ${isActive ? "bg-brand-50" : "hover:bg-gray-50"}
                ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {getStatusIcon(status)}

              {!collapsed && (
                <div className="text-sm font-medium truncate">
                  Bài {index + 1}: {item.title}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;