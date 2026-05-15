import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
} from "lucide-react";

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

type LessonGroup = {
  lessonId: string;
  lessonIndex: number;
  lessonTitle: string;
  status: LessonStatus;
  items: LessonItem[];
};

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
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const groupedLessons = useMemo<LessonGroup[]>(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.lessonId]) acc[item.lessonId] = [];
      acc[item.lessonId].push(item);
      return acc;
    }, {} as Record<string, LessonItem[]>);

    return Object.values(grouped).map((items, index) => {
      const videoItem = items.find((item) => item.type === "video");
      const lessonTitle = videoItem
        ? videoItem.title.replace(/^Bai \d+: /, "")
        : `Bai ${index + 1}`;

      const status: LessonStatus = items.some(
        (item) => (item.status || "locked") === "learning",
      )
        ? "learning"
        : items.every((item) => (item.status || "locked") === "done")
          ? "done"
          : "locked";

      return {
        lessonId: items[0].lessonId,
        lessonIndex: index + 1,
        lessonTitle,
        status,
        items,
      };
    });
  }, [data]);

  const activeLessonId = useMemo(() => {
    return data.find((item) => location.pathname === item.path)?.lessonId ?? null;
  }, [data, location.pathname]);

  const firstAccessibleLessonId = useMemo(() => {
    return (
      groupedLessons.find((group) =>
        group.items.some((item) => (item.status || "locked") !== "locked"),
      )?.lessonId ??
      groupedLessons[0]?.lessonId ??
      null
    );
  }, [groupedLessons]);

  useEffect(() => {
    setExpandedLessonId((prev) => {
      if (activeLessonId) return activeLessonId;
      if (prev && groupedLessons.some((group) => group.lessonId === prev)) {
        return prev;
      }
      return firstAccessibleLessonId;
    });
  }, [activeLessonId, firstAccessibleLessonId, groupedLessons]);

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

  const getGroupTone = (status: LessonStatus, expanded: boolean) => {
    if (expanded && status === "learning") {
      return "border-brand-100 bg-gradient-to-r from-brand-50 to-[#f8f6ef]";
    }
    if (expanded && status === "done") {
      return "border-emerald-100 bg-gradient-to-r from-emerald-50 to-white";
    }
    if (expanded) {
      return "border-slate-200 bg-slate-50";
    }
    return "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50";
  };

  const getDisplayTitle = (item: LessonItem) => {
    if (item.type === "quiz") return "Bài tập trắc nghiệm";
    if (item.type === "code") return "Bài tập lập trình";
    return "Video bài giảng";
  };

  const toggleLessonGroup = (lessonId: string) => {
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  };

  const handleCollapsedGroupClick = (group: LessonGroup) => {
    setCollapsed(false);
    setExpandedLessonId(group.lessonId);
  };

  const renderCollapsedDesktopGroups = () => (
    <div className="flex-1 space-y-2 overflow-y-auto px-2 py-3">
      {groupedLessons.map((group) => {
        const isActiveGroup = activeLessonId === group.lessonId;
        const isExpanded = expandedLessonId === group.lessonId;

        return (
          <button
            key={group.lessonId}
            type="button"
            title={`Bài ${group.lessonIndex}: ${group.lessonTitle}`}
            onClick={() => handleCollapsedGroupClick(group)}
            className={`group flex w-full flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition ${
              isActiveGroup
                ? "border-brand-200 bg-brand-50 shadow-sm ring-1 ring-brand-100/80"
                : isExpanded
                  ? "border-slate-200 bg-slate-50"
                  : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200/80">
              {getStatusIcon(group.status)}
            </div>

            <div className="flex h-7 min-w-[2.25rem] items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-bold text-slate-600">
              {group.lessonIndex}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderLessonGroups = (mode: "mobile" | "desktop") =>
    groupedLessons.map((group) => {
      const isExpanded = expandedLessonId === group.lessonId;

      return (
        <div
          key={group.lessonId}
          className={`overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all ${getGroupTone(
            group.status,
            isExpanded,
          )}`}
        >
          <button
            onClick={() => {
              toggleLessonGroup(group.lessonId);
            }}
            className="flex w-full items-start gap-3 px-3 py-3 text-left transition sm:px-4"
          >
            <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/85 ring-1 ring-slate-200/70">
              {getStatusIcon(group.status)}
            </div>

            {(mode === "mobile" || !collapsed) && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600/80">
                    Bài {group.lessonIndex}
                  </div>
                  <div className="mt-1 text-[15px] font-bold leading-6 text-slate-800">
                    {group.lessonTitle}
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className={`mt-2 flex-shrink-0 text-slate-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>

          {(mode === "mobile" || !collapsed) && isExpanded && (
            <div className="border-t border-slate-100/80 px-3 pb-3 pt-2 sm:px-4">
              <div className="ml-[18px] border-l border-slate-200/80 pl-4">
                <div className="space-y-2">
                  {group.items.map((item) => {
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
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                          isActive
                            ? "border-brand-200 bg-white text-brand-900 shadow-sm ring-1 ring-brand-100/70"
                            : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white/90"
                        } ${
                          isLocked
                            ? "cursor-not-allowed border-transparent text-slate-300 opacity-90"
                            : "text-slate-700"
                        }`}
                      >
                        {getStatusIcon(status)}

                        <div className="truncate text-[15px] font-medium">
                          {getDisplayTitle(item)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
          <div className="max-h-[55vh] space-y-3 overflow-y-auto border-t p-2">
            {renderLessonGroups("mobile")}
          </div>
        )}
      </div>

      <div
        className={`sticky top-0 hidden h-screen flex-col border-r bg-white transition-all duration-300 md:flex ${
          collapsed ? "w-[92px]" : "w-[320px]"
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

        {!collapsed ? (
          <>
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

            <div className="flex-1 space-y-3 overflow-y-auto p-2">
              {renderLessonGroups("desktop")}
            </div>
          </>
        ) : (
          renderCollapsedDesktopGroups()
        )}
      </div>
    </>
  );
};

export default Sidebar;
