import {
  ActivityProgressView,
  CourseProgressDetail,
  CourseProgressLesson,
} from "../api/userLessonProgress";

export interface UILessonItem {
  id: string;
  lessonId: string;
  lessonOrder: number;
  stepType: "video" | "quiz" | "code";
  stepLabel: string;
  title: string;
  type: "video" | "quiz" | "code";
  path: string;
  status: "locked" | "learning" | "done";
  originalLesson: any;
  assignment?: any | null;
  activity: ActivityProgressView;
}

const getLessonOrder = (lesson: any, fallbackIndex: number) => {
  const rawOrder = Number(lesson?.lesson_order ?? lesson?.lessonOrder);
  return Number.isFinite(rawOrder) && rawOrder > 0 ? rawOrder : fallbackIndex + 1;
};

const getStepLabel = (stepType: "video" | "quiz" | "code") => {
  if (stepType === "quiz") return "Quiz";
  if (stepType === "code") return "Code";
  return "Video";
};

const getStepTitle = (
  lesson: any,
  stepType: "video" | "quiz" | "code",
  lessonOrder: number,
) => {
  const baseTitle = `Bai ${lessonOrder}: ${lesson?.title || "Lesson"}`;
  if (stepType === "video") return baseTitle;
  return `${baseTitle} - ${getStepLabel(stepType)}`;
};

const toStatus = (
  activity?: ActivityProgressView | null,
): "locked" | "learning" | "done" => {
  if (!activity) return "locked";
  if (activity.completed) return "done";
  if (activity.unlocked) return "learning";
  return "locked";
};

const toFallbackActivity = (source: any): ActivityProgressView => ({
  status: source?.status || "LOCKED",
  completed: Boolean(source?.completed),
  unlocked: Boolean(source?.unlocked),
  lockedReason: source?.lockedReason ?? null,
  message: source?.message ?? null,
  completedAt: source?.completedAt ?? null,
  watchPercent: source?.watchPercent,
  passed: source?.passed,
  score: source?.score,
  submittedAt: source?.submittedAt,
  attemptsCount: source?.attemptsCount,
});

export const mapCourseToUILessons = (
  courseId: string,
  lessons: any[],
  progressDetail?: CourseProgressDetail | null,
): UILessonItem[] => {
  const progressByLessonId = new Map<string, CourseProgressLesson>(
    (progressDetail?.lessons || []).map((lesson) => [lesson.lessonId, lesson]),
  );

  return [...lessons]
    .sort((a, b) => getLessonOrder(a, 0) - getLessonOrder(b, 0))
    .flatMap((lesson, index) => {
      const lessonId = String(lesson?._id || lesson?.lessonId || "");
      const lessonOrder = getLessonOrder(lesson, index);
      const progressLesson = progressByLessonId.get(lessonId);
      const items: UILessonItem[] = [];

      const videoActivity = progressLesson?.video ?? toFallbackActivity(lesson?.video);
      items.push({
        id: `${lessonId}::video`,
        lessonId,
        lessonOrder,
        stepType: "video",
        stepLabel: "Video",
        title: getStepTitle(lesson, "video", lessonOrder),
        type: "video",
        path: `/learn/${courseId}/lesson/${lessonId}/video`,
        status: toStatus(videoActivity),
        originalLesson: lesson,
        assignment: null,
        activity: videoActivity,
      });

      if (lesson?.quiz) {
        const quizActivity = progressLesson?.quiz ?? toFallbackActivity(lesson.quiz);
        items.push({
          id: `${lessonId}::quiz`,
          lessonId,
          lessonOrder,
          stepType: "quiz",
          stepLabel: "Quiz",
          title: getStepTitle(lesson, "quiz", lessonOrder),
          type: "quiz",
          path: `/learn/${courseId}/lesson/${lessonId}/quiz`,
          status: toStatus(quizActivity),
          originalLesson: lesson,
          assignment: lesson.quiz,
          activity: quizActivity,
        });
      }

      if (lesson?.assignment) {
        const assignmentActivity =
          progressLesson?.assignment ?? toFallbackActivity(lesson.assignment);
        items.push({
          id: `${lessonId}::code`,
          lessonId,
          lessonOrder,
          stepType: "code",
          stepLabel: "Code",
          title: getStepTitle(lesson, "code", lessonOrder),
          type: "code",
          path: `/learn/${courseId}/lesson/${lessonId}/code`,
          status: toStatus(assignmentActivity),
          originalLesson: lesson,
          assignment: lesson.assignment,
          activity: assignmentActivity,
        });
      }

      return items;
    });
};
