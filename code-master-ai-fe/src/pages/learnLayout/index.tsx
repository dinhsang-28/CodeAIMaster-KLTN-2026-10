import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getLearningCourse,
  getLearningCourseProgress,
} from "../../api/course";
import { CourseProgressDetail } from "../../api/userLessonProgress";
import Navbar from "../../components/navbar";
import { mapCourseToUILessons, UILessonItem } from "../../utils/learningMapper";
import ExercisePage from "../lesson/excersite";
import LessonPage from "../lesson/index";
import Sidebar from "../lesson/sidebar";
import Quizz from "../quizz/index";

interface SidebarLessonItem {
  id: string;
  lessonId: string;
  title: string;
  path: string;
  type: string;
  status: "locked" | "learning" | "done";
}

const toSidebarItems = (items: UILessonItem[]): SidebarLessonItem[] => {
  return items.map((item) => ({
    id: item.id,
    lessonId: item.lessonId,
    title: item.title,
    path: item.path,
    type: item.type,
    status: item.status,
  }));
};

const LearnLayout = () => {
  const { courseId, lessonId, stepType } = useParams();
  const navigate = useNavigate();

  const [progressDetail, setProgressDetail] =
    useState<CourseProgressDetail | null>(null);
  const [uiLessons, setUiLessons] = useState<UILessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadLearningState = useCallback(
    async (showLoading = true) => {
      if (!courseId) return;

      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const [learningData, progressData] = await Promise.all([
          getLearningCourse(courseId),
          getLearningCourseProgress(courseId),
        ]);

        const normalizedCourse = {
          ...(learningData?.course || learningData),
          lessons: learningData?.lessons || learningData?.course?.lessons || [],
        };

        setProgressDetail(progressData);
        setUiLessons(
          mapCourseToUILessons(
            courseId,
            normalizedCourse.lessons || [],
            progressData,
          ),
        );
        setError("");
      } catch (err: any) {
        setError(err?.message || "Không thể tải khóa học");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [courseId],
  );

  useEffect(() => {
    void loadLearningState(true);
  }, [loadLearningState]);

  const resumeLessonPath = useMemo(() => {
    if (!uiLessons.length) return null;

    const inProgressItem = uiLessons.find(
      (item) => item.activity?.status === "IN_PROGRESS",
    );
    if (inProgressItem) return inProgressItem.path;

    const activeUnlockedItem = uiLessons.find(
      (item) => item.status === "learning" && !item.activity?.completed,
    );
    if (activeUnlockedItem) return activeUnlockedItem.path;

    const lastCompletedItem = [...uiLessons]
      .reverse()
      .find((item) => item.status === "done");
    if (lastCompletedItem) return lastCompletedItem.path;

    const firstAccessibleItem = uiLessons.find((item) => item.status !== "locked");
    if (firstAccessibleItem) return firstAccessibleItem.path;

    return uiLessons[0]?.path ?? null;
  }, [uiLessons]);

  useEffect(() => {
    if (!loading && !lessonId && !stepType && resumeLessonPath) {
      navigate(resumeLessonPath, { replace: true });
    }
  }, [loading, lessonId, stepType, resumeLessonPath, navigate]);

  const currentLessonKey = lessonId && stepType ? `${lessonId}::${stepType}` : null;

  const currentLessonItem = useMemo(() => {
    if (!uiLessons.length) return null;
    if (!currentLessonKey) {
      return uiLessons.find((lesson) => lesson.path === resumeLessonPath) || uiLessons[0];
    }
    return uiLessons.find((lesson) => lesson.id === currentLessonKey) || null;
  }, [currentLessonKey, resumeLessonPath, uiLessons]);

  const currentLessonIndex = useMemo(() => {
    if (!currentLessonItem) return -1;
    return uiLessons.findIndex((lesson) => lesson.id === currentLessonItem.id);
  }, [currentLessonItem, uiLessons]);

  const nextLessonPath =
    currentLessonIndex >= 0 ? uiLessons[currentLessonIndex + 1]?.path : undefined;

  const refreshLearningState = useCallback(async () => {
    await loadLearningState(false);
  }, [loadLearningState]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải khóa học...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const renderContent = () => {
    if (!currentLessonItem) {
      return (
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          Vui lòng chọn một bài học.
        </div>
      );
    }

    if (currentLessonItem.status === "locked") {
      return (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Bài học đang bị khóa
          </h2>
          <p className="text-gray-500">
            {currentLessonItem.activity?.message ||
              "Vui lòng hoàn thành các bước trước đó để mở khóa nội dung này."}
          </p>
        </div>
      );
    }

    if (currentLessonItem.type === "quiz") {
      return (
        <Quizz
          courseId={courseId}
          lessonId={currentLessonItem.lessonId}
          assignment={currentLessonItem.assignment}
          nextPath={nextLessonPath}
          onComplete={refreshLearningState}
        />
      );
    }

    if (currentLessonItem.type === "code") {
      return (
        <ExercisePage
          courseId={courseId}
          lessonId={currentLessonItem.lessonId}
          assignment={currentLessonItem.assignment}
          nextPath={nextLessonPath}
          onComplete={refreshLearningState}
        />
      );
    }

    return (
      <LessonPage
        courseId={courseId}
        lessonId={currentLessonItem.lessonId}
        lessonData={currentLessonItem.originalLesson}
        nextPath={nextLessonPath}
        onComplete={refreshLearningState}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50">
      <Navbar />

      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden md:flex-row">
        <Sidebar
          data={toSidebarItems(uiLessons)}
          completedCount={progressDetail?.completedActivities ?? 0}
          totalCount={progressDetail?.totalActivities ?? uiLessons.length}
          progressPercent={progressDetail?.progressPercent ?? 0}
        />

        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-4 md:px-6 md:py-6">
            {refreshing && (
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-700">
                Đang đồng bộ tiến độ học tập...
              </div>
            )}

            <main className="min-w-0 overflow-x-hidden">{renderContent()}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnLayout;
