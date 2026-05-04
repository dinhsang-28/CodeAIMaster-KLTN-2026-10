import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Play, Lock, ChevronLeft, ChevronRight } from "lucide-react";

interface LessonItem {
  id: string;
  lessonId: string;
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
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
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

  const completedSet = new Set(completedLessons);
  const completedCount = data.filter((item) =>
    completedSet.has(item.id) || completedSet.has(`${item.lessonId}::video`) || completedSet.has(`${item.lessonId}::quiz`) || completedSet.has(`${item.lessonId}::code`)
  ).length;
  const progressPercent = data.length > 0 ? (completedCount / data.length) * 100 : 0;

  const getStatus = (item: LessonItem, index: number): LessonStatus => {
    const prevItems = data.slice(0, index);
    const videoKey = `${item.lessonId}::video`;
    const quizKey = `${item.lessonId}::quiz`;
    const codeKey = `${item.lessonId}::code`;
    const isCurrent = index === currentIndex;
    const isDone = completedSet.has(item.id) || completedSet.has(videoKey) || completedSet.has(quizKey) || completedSet.has(codeKey);

    if (isCurrent) return "learning";
    if (isDone) return "done";

    const sameLessonItems = data.filter((x) => x.lessonId === item.lessonId);
    const currentPosition = sameLessonItems.findIndex((x) => x.id === item.id);
    const previousInLesson = sameLessonItems.slice(0, currentPosition);
    const prerequisiteMet = previousInLesson.every((x) =>
      completedSet.has(x.id) || completedSet.has(`${x.lessonId}::video`) || completedSet.has(`${x.lessonId}::quiz`) || completedSet.has(`${x.lessonId}::code`)
    );

    if (prerequisiteMet) return "learning";
    if (prevItems.some((x) => completedSet.has(x.id) || completedSet.has(`${x.lessonId}::video`) || completedSet.has(`${x.lessonId}::quiz`) || completedSet.has(`${x.lessonId}::code`))) {
      return "locked";
    }

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

  // Group items by lessonId
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.lessonId]) acc[item.lessonId] = [];
    acc[item.lessonId].push(item);
    return acc;
  }, {} as Record<string, LessonItem[]>);
  
  const groupedArray = Object.values(groupedData);

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
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {groupedArray.map((group, groupIndex) => {
          const videoItem = group.find(i => i.type === 'video');
          const lessonTitle = videoItem ? videoItem.title : `Bài ${groupIndex + 1}`;

          return (
            <div key={group[0].lessonId} className="space-y-1">
              {!collapsed && (
                <div className="text-xs font-bold text-gray-500 uppercase px-3 py-1 mb-1">
                  Bài {groupIndex + 1}: {lessonTitle.replace(/^Bài \d+: /, '')}
                </div>
              )}
              {group.map((item) => {
                const globalIndex = data.findIndex(d => d.id === item.id);
                const status = getStatus(item, globalIndex);
                const isActive = location.pathname === item.path;
                const isLocked = status === "locked";

                let displayTitle = item.title;
                if (item.type !== 'video') {
                  // For sub-items, just show the type e.g., "Quiz", "Code"
                  displayTitle = item.type === 'quiz' ? 'Bài tập trắc nghiệm' : 'Bài tập lập trình';
                } else {
                  displayTitle = 'Video bài giảng';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => !isLocked && navigate(item.path)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition
                      ${collapsed ? "justify-center" : "pl-6"}
                      ${isActive ? "bg-brand-50" : "hover:bg-gray-50"}
                      ${isLocked ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {getStatusIcon(status)}

                    {!collapsed && (
                      <div className="text-sm font-medium truncate">
                        {displayTitle}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;