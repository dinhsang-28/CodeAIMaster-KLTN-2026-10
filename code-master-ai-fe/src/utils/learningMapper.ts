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
}

const ASSIGNMENT_KIND = {
  quiz: ["quiz", "quizAssignment"],
  code: ["code", "codeAssignment"],
} as const;

const hasExplicitLock = (lesson: any) =>
  lesson?.access?.isLocked === true ||
  lesson?.locked === true ||
  lesson?.isLocked === true ||
  lesson?.locked_by_backend === true;

const getAssignments = (lesson: any) => (Array.isArray(lesson?.assignments) ? lesson.assignments : []);

const hasKind = (assignment: any, kinds: readonly string[]) => {
  const rawType = String(assignment?.type || "").trim();
  return kinds.includes(rawType) || kinds.includes(rawType.toLowerCase());
};

const getQuizAssignment = (lesson: any) => {
  const assignments = getAssignments(lesson);
  return (
    assignments.find(
      (a: any) =>
        hasKind(a, ASSIGNMENT_KIND.quiz) ||
        Boolean(a?.quiz) ||
        (Array.isArray(a?.quizzes) && a.quizzes.length > 0)
    ) || null
  );
};

const getCodeAssignment = (lesson: any) => {
  const assignments = getAssignments(lesson);
  return (
    assignments.find(
      (a: any) =>
        hasKind(a, ASSIGNMENT_KIND.code) ||
        Boolean(a?.codeAssignment) ||
        Boolean(a?.code_assignment) ||
        (Array.isArray(a?.code_assignments) && a.code_assignments.length > 0)
    ) || null
  );
};

const getLessonOrder = (lesson: any, fallbackIndex: number) => {
  const order = Number(lesson?.lesson_order ?? lesson?.order ?? lesson?.sort_order);
  return Number.isFinite(order) && order > 0 ? order : fallbackIndex + 1;
};

const getStepLabel = (stepType: "video" | "quiz" | "code") => {
  if (stepType === "quiz") return "Quiz";
  if (stepType === "code") return "Code";
  return "Bài học";
};

const getStepTitle = (lesson: any, stepType: "video" | "quiz" | "code", lessonOrder: number) => {
  const baseTitle = `Bài ${lessonOrder}: ${lesson.title}`;
  if (stepType === "video") return baseTitle;
  return `${baseTitle} - ${getStepLabel(stepType)}`;
};

const getStepStatus = (
  lesson: any,
  progress: any,
  stepType: "video" | "quiz" | "code",
  hasStep: boolean
): "locked" | "learning" | "done" => {
  if (hasExplicitLock(lesson)) return "locked";
  if (!hasStep) return "learning";

  const isCompleted =
    progress?.isCompleted === true ||
    String(progress?.status || "").toUpperCase() === "COMPLETED";
  const watchPercent = Number(progress?.watchPercent ?? 0);

  if (stepType === "video") {
    return watchPercent >= 80 || isCompleted ? "done" : "learning";
  }

  if (stepType === "quiz") {
    return isCompleted ? "done" : "learning";
  }

  return isCompleted ? "done" : "learning";
};

export const mapCourseToUILessons = (
  courseId: string,
  lessons: any[],
  progressMap: Record<string, any> = {}
): UILessonItem[] => {
  return [...lessons]
    .sort((a, b) => getLessonOrder(a, 0) - getLessonOrder(b, 0))
    .flatMap((lesson, index) => {
      const progress = progressMap[lesson._id];
      const lessonOrder = getLessonOrder(lesson, index);
      const quizAssignment = getQuizAssignment(lesson);
      const codeAssignment = getCodeAssignment(lesson);
      const items: UILessonItem[] = [];

      items.push({
        id: `${lesson._id}::video`,
        lessonId: lesson._id,
        lessonOrder,
        stepType: "video",
        stepLabel: getStepLabel("video"),
        title: getStepTitle(lesson, "video", lessonOrder),
        type: "video",
        path: `/learn/${courseId}/lesson/${lesson._id}/video`,
        status: getStepStatus(lesson, progress, "video", true),
        originalLesson: lesson,
        assignment: null,
      });

      if (quizAssignment) {
        items.push({
          id: `${lesson._id}::quiz`,
          lessonId: lesson._id,
          lessonOrder,
          stepType: "quiz",
          stepLabel: getStepLabel("quiz"),
          title: getStepTitle(lesson, "quiz", lessonOrder),
          type: "quiz",
          path: `/learn/${courseId}/lesson/${lesson._id}/quiz`,
          status: getStepStatus(lesson, progress, "quiz", true),
          originalLesson: lesson,
          assignment: quizAssignment,
        });
      }

      if (codeAssignment) {
        items.push({
          id: `${lesson._id}::code`,
          lessonId: lesson._id,
          lessonOrder,
          stepType: "code",
          stepLabel: getStepLabel("code"),
          title: getStepTitle(lesson, "code", lessonOrder),
          type: "code",
          path: `/learn/${courseId}/lesson/${lesson._id}/code`,
          status: getStepStatus(lesson, progress, "code", true),
          originalLesson: lesson,
          assignment: codeAssignment,
        });
      }

      return items;
    });
};
