import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLearningCourse } from "../../api/course";
import { openLessonProgress, UserLessonProgress } from "../../api/userLessonProgress";
import { mapCourseToUILessons, UILessonItem } from "../../utils/learningMapper";
import Sidebar from "../lesson/sidebar";
import Navbar from "../../components/navbar";
import LessonPage from "../lesson";
import Quizz from "../quizz";
import ExercisePage from "../lesson/excersite";

interface LessonItem {
  id: string;
  lessonId: string;
  title: string;
  path: string;
  type: string;
}

const toLessonItems = (items: UILessonItem[]): LessonItem[] => {
  return items.map((item) => ({
    id: item.id,
    lessonId: item.lessonId,
    title: item.title,
    path: item.path,
    type: item.type,
  }));
};

const LearnLayout = () => {
  const { courseId, lessonId, stepType } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [uiLessons, setUiLessons] = useState<UILessonItem[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, UserLessonProgress>>({});
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [error, setError] = useState("");

  const currentRequestId = useRef<number>(0);
  const markStepCompleted = (stepItemId: string, score?: number) => {
    const saved = localStorage.getItem("completed_lessons");
    const completed = saved ? JSON.parse(saved) : [];

    if (!completed.includes(stepItemId)) {
      completed.push(stepItemId);
      localStorage.setItem("completed_lessons", JSON.stringify(completed));
    }

    if (typeof score === "number" && lessonId && stepType) {
      localStorage.setItem(`quiz_${lessonId}_${stepType}_score`, String(score));
    }

    window.dispatchEvent(new Event("lessonsUpdated"));
  };

  // 1. Fetch Course Detail
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoadingCourse(true);
        const courseData = await getLearningCourse(courseId);

        // Course data now contains course, progress, lessons.
        const fetchedLessons = courseData.lessons || courseData.course?.lessons || [];
        const normalizedCourse = {
          ...(courseData.course || courseData),
          lessons: fetchedLessons,
        };

        setCourse(normalizedCourse);

        const mapped = mapCourseToUILessons(
          courseId,
          fetchedLessons,
          progressMap,
        );
        setUiLessons(mapped);

        if ((!lessonId || !stepType) && mapped.length > 0) {
          navigate(mapped[0].path, { replace: true });
        } else if (lessonId && stepType) {
          setSelectedLessonId(`${lessonId}::${stepType}`);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải khoá học");
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]); // only re-run if courseId changes

  useEffect(() => {
    if (lessonId && stepType) {
      const nextSelectedId = `${lessonId}::${stepType}`;
      if (nextSelectedId !== selectedLessonId) {
        setSelectedLessonId(nextSelectedId);
      }
    }
  }, [lessonId, stepType, selectedLessonId]);

  useEffect(() => {
    if (!lessonId || !course) return;

    const reqId = ++currentRequestId.current;

    const openProgress = async () => {
      setLoadingLesson(true);
      try {
        const progress = await openLessonProgress(lessonId);
        if (reqId !== currentRequestId.current) return; // stale

        setProgressMap(prev => {
          const updated = { ...prev, [lessonId]: progress };
          setUiLessons(mapCourseToUILessons(courseId!, course.lessons || [], updated));
          return updated;
        });
      } catch (err) {
        console.error("Failed to open lesson progress:", err);
      } finally {
        if (reqId === currentRequestId.current) {
          setLoadingLesson(false);
        }
      }
    };

    openProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, course, courseId]);

  const currentLessonItem = useMemo(
    () => uiLessons.find((lesson) => lesson.id === selectedLessonId) || null,
    [uiLessons, selectedLessonId]
  );
  const currentLessonIndex = useMemo(
    () => uiLessons.findIndex((lesson) => lesson.id === selectedLessonId),
    [uiLessons, selectedLessonId]
  );
  const currentSidebarItemId = currentLessonItem?.id ?? null;
  const nextLessonPath = currentLessonIndex >= 0 ? uiLessons[currentLessonIndex + 1]?.path : undefined;

  if (loadingCourse) {
    return <div className="p-8 text-center text-slate-500">Đang tải khoá học...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const renderContent = () => {
    if (loadingLesson) {
      return <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Đang tải nội dung...</div>;
    }
    
    if (!currentLessonItem) {
      return <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Vui lòng chọn một bài học.</div>;
    }

    if (currentLessonItem.status === "locked") {
      return (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Bài học đã bị khóa</h2>
          <p className="text-gray-500">
            {currentLessonItem.originalLesson?.access?.reason || "Vui lòng hoàn thành các bài học trước đó để mở khóa nội dung này."}
          </p>
        </div>
      );
    }

    if (currentLessonItem.type === "quiz") {
      return (
        <Quizz
          assignment={currentLessonItem.assignment}
          nextPath={nextLessonPath}
          onComplete={(score) => {
            if (currentSidebarItemId !== null) {
              markStepCompleted(currentSidebarItemId, score);
            }
          }}
        />
      );
    }

    if (currentLessonItem.type === "code") {
      return (
        <ExercisePage
          assignment={currentLessonItem.assignment}
          nextPath={nextLessonPath}
          onComplete={() => {
            if (currentSidebarItemId !== null) {
              markStepCompleted(currentSidebarItemId);
            }
          }}
        />
      );
    }

    return (
      <LessonPage
        lessonData={currentLessonItem.originalLesson}
        nextPath={nextLessonPath}
        onComplete={() => {
          if (currentSidebarItemId !== null) {
            markStepCompleted(currentSidebarItemId);
          }
        }}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50">
      <Navbar />

      <div className="flex min-h-0 flex-1 overflow-x-hidden">
        <Sidebar 
          data={toLessonItems(uiLessons)}
        />

        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
            <main className="min-w-0 overflow-x-hidden">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnLayout;
