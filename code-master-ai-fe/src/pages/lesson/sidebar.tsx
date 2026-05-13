import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";

interface LessonItem {
  id: string;
  lessonId: string;
  title: string;
  path: string;
  type: string;
  status?: "locked" | "learning" | "done";
}

interface SidebarProps {
  data: LessonItem[];
  completedCount?: number;
  totalCount?: number;
  progressPercent?: number;
}

type LessonStatus = "done" | "learning" | "locked";

const Sidebar = ({
  data,
  completedCount = 0,
  totalCount = data.length,
  progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const groupedArray = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.lessonId]) acc[item.lessonId] = [];
      acc[item.lessonId].push(item);
      return acc;
    }, {} as Record<string, LessonItem[]>);

    return Object.values(grouped);
  }, [data]);

  const getStatusIcon = (status: LessonStatus) => {
    switch (status) {
      case "done":
        return <CheckCircle2 size={18} className="text-brand-600" />;
      case "learning":
        return <Play size={18} className="fill-brand-600 text-brand-600" />;
      default:
        return <Lock size={18} className="text-gray-300" />;
    }
  };

  const getDisplayTitle = (item: LessonItem) => {
    if (item.type === "quiz") return "Bài tập trắc nghiệm";
    if (item.type === "code") return "Bài tập lập trình";
    return "Video bài giảng";
  };

  const renderLessonGroups = (mode: "mobile" | "desktop") =>
    groupedArray.map((group, groupIndex) => {
      const videoItem = group.find((item) => item.type === "video");
      const lessonTitle = videoItem
        ? videoItem.title.replace(/^Bai \d+: /, "")
        : `Bai ${groupIndex + 1}`;

      return (
        <div key={group[0].lessonId} className="space-y-1">
          {(mode === "mobile" || !collapsed) && (
            <div className="mb-1 px-3 py-1 text-xs font-bold uppercase text-gray-500">
              Bài {groupIndex + 1}: {lessonTitle}
            </div>
          )}

          {group.map((item) => {
            const status = item.status || "locked";
            const isLocked = status === "locked";
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) return;
                  if (mode === "mobile") {
                    setMobileOpen(false);
                  }
                  navigate(item.path);
                }}
                disabled={isLocked}
                className={`flex w-full items-center gap-3 rounded-xl transition ${
                  mode === "desktop" && collapsed
                    ? "justify-center px-3 py-3"
                    : "px-4 py-3 text-left md:pl-6"
                } ${
                  isActive ? "bg-brand-50" : "hover:bg-gray-50"
                } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {getStatusIcon(status)}

                {(mode === "mobile" || !collapsed) && (
                  <div className="truncate text-sm font-medium">
                    {getDisplayTitle(item)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    });

  return (
    <>
      <div className="sticky top-0 z-20 border-b bg-white md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold uppercase text-brand-700">
                Nội dung khóa học
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {completedCount}/{totalCount} hoàn thành, {Math.round(progressPercent)}%
              </p>
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-lg p-2 transition hover:bg-gray-100"
            >
              {mobileOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {mobileOpen && (
          <div className="max-h-[55vh] space-y-4 overflow-y-auto border-t p-2">
            {renderLessonGroups("mobile")}
          </div>
        )}
      </div>

      <div
        className={`sticky top-0 hidden h-screen flex-col border-r bg-white transition-all duration-300 md:flex ${
          collapsed ? "w-[84px]" : "w-[320px]"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          {!collapsed && (
            <h2 className="text-sm font-bold uppercase text-brand-700">
              Nội dung khóa học
            </h2>
          )}

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="border-b px-4 py-3">
            <div className="mb-2 flex justify-between text-xs">
              <span>
                {completedCount}/{totalCount}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-2">
          {renderLessonGroups("desktop")}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
