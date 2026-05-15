import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateVideoProgress } from "../../api/userLessonProgress";

type LessonPageProps = {
  courseId?: string;
  lessonId?: string;
  lessonData?: any;
  nextPath?: string;
  onComplete?: (payload?: {
    lessonId: string;
    activityType: "video";
    completed: boolean;
    watchPercent?: number;
    completedAt?: string;
  }) => Promise<void> | void;
};

type ContentSection = {
  heading?: string;
  paragraphs: string[];
  listItems: string[];
  listStyle?: "dot" | "dash";
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

const normalizeContentText = (value?: string) => {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, " ")
    .trim();
};

const splitContentIntoSections = (content?: string): ContentSection[] => {
  const normalized = normalizeContentText(content)
    .replace(/^\d+\.\s*Nội dung bài học\s*/i, "")
    .replace(/^\d+\.\s*$/m, "")
    .trim();

  if (!normalized) return [];

  const prepared = normalized.replace(/\s+(?=\d+\.\d+\s)/g, "\n");
  const lines = prepared
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sections: ContentSection[] = [];
  let currentSection: ContentSection = {
    heading: undefined,
    paragraphs: [],
    listItems: [],
    listStyle: "dot",
  };
  let collectingImplicitList = false;

  const pushSection = () => {
    if (
      currentSection.heading ||
      currentSection.paragraphs.length > 0 ||
      currentSection.listItems.length > 0
    ) {
      sections.push(currentSection);
    }
  };

  lines.forEach((line) => {
    const headingMatch = line.match(/^(\d+\.\d+\s+.+)$/);

    if (headingMatch) {
      pushSection();
      currentSection = {
        heading: headingMatch[1].trim(),
        paragraphs: [],
        listItems: [],
        listStyle: "dot",
      };
      collectingImplicitList = false;
      return;
    }

    if (/^[•▪\-*]\s+/.test(line)) {
      currentSection.listItems.push(line.replace(/^[•▪\-*]\s+/, "").trim());
      currentSection.listStyle = "dot";
      collectingImplicitList = true;
      return;
    }

    if (collectingImplicitList) {
      currentSection.listItems.push(line);
      currentSection.listStyle = "dot";
      return;
    }

    currentSection.paragraphs.push(line);

    if (line.endsWith(":")) {
      collectingImplicitList = true;
    }
  });

  pushSection();
  return sections.map((section) => {
    if (section.listItems.length > 0 || section.paragraphs.length < 3) {
      return section;
    }

    const nonSentenceCount = section.paragraphs.filter(
      (line) => !/[.!?:]$/.test(line.trim()),
    ).length;

    if (nonSentenceCount >= Math.ceil(section.paragraphs.length * 0.6)) {
      return {
        ...section,
        paragraphs: [],
        listItems: section.paragraphs,
        listStyle: "dash",
      };
    }

    return section;
  });
};

const LessonPage = ({
  courseId,
  lessonId,
  lessonData,
  nextPath,
  onComplete,
}: LessonPageProps) => {
  const navigate = useNavigate();
  const [canProceed, setCanProceed] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCanProceed(false);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(
      () => setCanProceed(true),
      1 * 60 * 1000,
    );

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [lessonId]);

  const resolvedVideoUrl = useMemo(() => {
    return (
      lessonData?.video?.videoUrl ||
      lessonData?.videoUrl ||
      lessonData?.video_url ||
      ""
    );
  }, [lessonData]);

  const contentSections = useMemo(() => {
    return splitContentIntoSections(
      lessonData?.content || lessonData?.description,
    );
  }, [lessonData]);

  const summaryText = useMemo(() => {
    const description = normalizeContentText(lessonData?.description);
    if (description) return description;

    const firstSection = contentSections.find(
      (section) =>
        section.paragraphs.length > 0 ||
        section.listItems.length > 0 ||
        section.heading,
    );

    if (!firstSection) return "";
    if (firstSection.paragraphs.length > 0) return firstSection.paragraphs[0];
    if (firstSection.listItems.length > 0) return firstSection.listItems[0];
    return firstSection.heading || "";
  }, [contentSections, lessonData]);

  if (!lessonData) {
    return <div>Khong co bai hoc.</div>;
  }

  const completeLesson = async () => {
    if (!lessonId) return;

    setIsUpdating(true);

    try {
      await updateVideoProgress({
        courseId,
        lessonId,
        watchPercent: 100,
      });

      await onComplete?.({
        lessonId,
        activityType: "video",
        completed: true,
        watchPercent: 100,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-6 md:space-y-8">
      {resolvedVideoUrl && (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-6 md:px-8 md:py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Video lesson
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight text-slate-900 md:text-[34px]">
              {lessonData.title}
            </h1>
            {summaryText && (
              <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-500 md:text-base">
                {summaryText}
              </p>
            )}
          </div>

          <div className="aspect-video w-full bg-slate-950">
            <iframe
              src={getYoutubeEmbedUrl(resolvedVideoUrl)}
              title="Video bai hoc"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {!resolvedVideoUrl && (
        <div className="rounded-[28px] bg-white px-6 py-6 shadow-sm ring-1 ring-slate-200 md:px-8 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            Lesson
          </p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-slate-900 md:text-[34px]">
            {lessonData.title}
          </h1>
          {summaryText && (
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-500 md:text-base">
              {summaryText}
            </p>
          )}
        </div>
      )}

      <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 md:p-8">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Noi dung bai hoc
          </p>
        </div>

        {contentSections.length > 0 ? (
          <div className="space-y-5">
            {contentSections.map((section, index) => (
              <div key={`${section.heading || "section"}-${index}`} className="max-w-[980px]">
                {section.heading && (
                  <h3 className="mb-2 text-[22px] font-semibold leading-snug text-slate-900 md:text-[26px]">
                    {section.heading}
                  </h3>
                )}

                {section.paragraphs.length > 0 && (
                  <div className="space-y-2.5">
                    {section.paragraphs.map((line, lineIndex) => (
                      <p
                        key={`${index}-paragraph-${lineIndex}`}
                        className="text-[16px] leading-7 text-slate-700 md:text-[17px] md:leading-8"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {section.listItems.length > 0 && (
                  section.listStyle === "dash" ? (
                    <ul className="mt-2 space-y-2 pl-8">
                      {section.listItems.map((line, lineIndex) => (
                        <li
                          key={`${index}-list-${lineIndex}`}
                          className="list-none text-[16px] leading-7 text-slate-700 md:text-[17px] md:leading-8"
                        >
                          <span className="mr-3 inline-block font-semibold text-slate-500">
                            -
                          </span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-2 list-disc space-y-2 pl-9 marker:text-brand-600">
                      {section.listItems.map((line, lineIndex) => (
                        <li
                          key={`${index}-list-${lineIndex}`}
                          className="text-[16px] leading-7 text-slate-700 md:text-[17px] md:leading-8"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-sm text-slate-500">
            Khong co noi dung bai hoc.
          </div>
        )}
      </div>

      <div className="rounded-[28px] bg-brand-50 p-4 text-center ring-1 ring-brand-100 sm:p-5 md:p-6">
        <h3 className="mb-2 text-lg font-semibold text-brand-700">
          Bạn đã hoàn thành phần video này?
        </h3>

        <p className="mb-6 text-sm text-brand-500">
          Đánh dấu hoàn thành để mở bài quizz
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={async () => {
              if (!canProceed || isUpdating) return;
              await completeLesson();
              if (nextPath) {
                navigate(nextPath);
              }
            }}
            disabled={!canProceed || isUpdating}
            className={`w-full rounded-full px-6 py-2.5 text-white transition sm:w-auto ${
              canProceed && !isUpdating
                ? "bg-brand-500 hover:bg-brand-700"
                : "cursor-not-allowed bg-brand-300"
            }`}
          >
            {isUpdating
              ? "Đang lưu..."
              : canProceed
                ? "Hoàn thành"
                : "Xem 4 phút để hoàn thành bài học"}
          </button>

          {nextPath && (
            <button
              onClick={() => {
                if (!canProceed || isUpdating) return;
                navigate(nextPath);
              }}
              disabled={!canProceed || isUpdating}
              className={`w-full rounded-full border px-6 py-2.5 transition sm:w-auto ${
                canProceed ? "hover:bg-gray-100" : "cursor-not-allowed opacity-60"
              }`}
            >
              Bài tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
