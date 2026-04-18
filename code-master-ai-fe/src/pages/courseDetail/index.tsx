import React, { useState, useEffect } from "react";
import {
  CourseDetail,
  TabKey,
  fakeRelatedCourses,
} from "../../data/courseDetail";
import { useParams } from "react-router-dom";
import { GetCoursesDetail } from "../../api/courseDetail";
import { createCartItem } from "../../api/cart";
const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const mapLevelLabel = (level: CourseDetail["level"]) => {
  switch (level) {
    case "beginner":
      return "Cơ bản";
    case "intermediate":
      return "Trung bình";
    case "advanced":
      return "Nâng cao";
    default:
      return level;
  }
};

const mapStatusLabel = (status: CourseDetail["status"]) => {
  switch (status) {
    case "active":
      return "Đang mở bán";
    case "inactive":
      return "Ngừng bán";
    default:
      return status;
  }
};

const tabButtonClass = (active: boolean) =>
  `px-6 py-4 border-b-2 whitespace-nowrap text-sm font-semibold transition ${
    active
      ? "border-brand-600 text-brand-700"
      : "border-transparent text-slate-500 hover:text-brand-600"
  }`;

export default function CourseDetailPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("intro");
  const [openSectionIndex, setOpenSectionIndex] = useState<number>(0);
  const { id } = useParams();
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        if (!id) return;
        const data = await GetCoursesDetail(id);
        setCourseDetail(data.data);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết khóa học: ", err);
      }
    };

    fetchCourseDetail();
  }, [id]);
  const onCart = async () => {
    if (!courseDetail) return;
    try {
      await createCartItem(courseDetail._id);
      console.log("Thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng: ", error);
    }
  };
  if (!courseDetail) {
    return (
      <div className="min-h-screen bg-brand-25 px-4 py-10">
        <p className="text-slate-600">Đang tải chi tiết khóa học...</p>
      </div>
    );
  }
  const summaryStats = [
    { label: "Trình độ", value: mapLevelLabel(courseDetail.level) },
    { label: "Trạng thái", value: mapStatusLabel(courseDetail.status) },
    { label: "Cập nhật", value: formatDate(courseDetail.updatedAt) },
    {
      label: "Danh mục",
      value: courseDetail.category.category_name,
    },
  ];
  return (
    <div className="min-h-screen bg-brand-25 text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-brand-600">
            Trang chủ
          </a>
          <span>/</span>
          <a href="/" className="hover:text-brand-600">
            Khóa học
          </a>
          <span>/</span>
          <span className="font-medium text-brand-700">
            {courseDetail.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
              <div className="relative aspect-video">
                <img
                  src={courseDetail.thumbnail}
                  alt={courseDetail.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <span className="inline-flex rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    Backend Development
                  </span>
                </div>
              </div>
            </div>

            <section className="space-y-6">
              <h1 className="text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
                {courseDetail.title}
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-slate-600">
                {courseDetail.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                {summaryStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-brand-100 bg-white p-5 text-center shadow-sm"
                  >
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="font-bold text-brand-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-8 flex overflow-x-auto border-b border-brand-100">
                <button
                  className={tabButtonClass(activeTab === "intro")}
                  onClick={() => setActiveTab("intro")}
                >
                  Giới thiệu
                </button>
                <button
                  className={tabButtonClass(activeTab === "content")}
                  onClick={() => setActiveTab("content")}
                >
                  Nội dung khóa học
                </button>
                <button
                  className={tabButtonClass(activeTab === "reviews")}
                  onClick={() => setActiveTab("reviews")}
                >
                  Đánh giá
                </button>
              </div>

              <div className="space-y-10">
                {(activeTab === "intro" || activeTab === "content") && (
                  <section>
                    <h3 className="mb-5 text-2xl font-bold text-brand-800">
                      Bạn sẽ học được gì?
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {courseDetail.learning_outcomes?.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <span className="mt-0.5 text-brand-600">✓</span>
                          <p className="text-slate-600">{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(activeTab === "intro" || activeTab === "content") && (
                  <section>
                    <h3 className="mb-5 text-2xl font-bold text-brand-800">
                      Nội dung khóa học
                    </h3>

                    {(activeTab === "intro" || activeTab === "content") && (
                      <section>
                        <h3 className="mb-5 text-2xl font-bold text-brand-800">
                          Nội dung khóa học
                        </h3>

                        <div className="space-y-4">
                          {courseDetail.lessons?.map((lesson, index) => (
                            <div
                              key={lesson._id}
                              className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSectionIndex(
                                    openSectionIndex === index ? -1 : index,
                                  )
                                }
                                className="flex w-full items-center justify-between px-5 py-4 text-left"
                              >
                                <div>
                                  <p className="font-bold text-brand-900">
                                    Bài {lesson.lesson_order}: {lesson.title}
                                  </p>
                                </div>
                                <span className="text-xl text-brand-400">
                                  {openSectionIndex === index ? "−" : "+"}
                                </span>
                              </button>

                              {openSectionIndex === index && (
                                <div className="space-y-3 border-t border-brand-50 px-5 py-4">
                                  {lesson.content && (
                                    <p className="text-sm text-slate-700">
                                      {lesson.content}
                                    </p>
                                  )}

                                  {lesson.video_url && (
                                    <a
                                      href={lesson.video_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700"
                                    >
                                      Xem video bài học
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </section>
                )}

                {activeTab === "intro" && (
                  <section>
                    <h3 className="mb-4 text-2xl font-bold text-brand-800">
                      Yêu cầu đầu vào
                    </h3>
                    <ul className="space-y-3">
                      {courseDetail.requirements?.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-slate-600"
                        >
                          <span className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {activeTab === "reviews" && (
                  <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-2xl font-bold text-brand-800">
                      Đánh giá học viên
                    </h3>
                    <p className="text-slate-600">
                      Chưa có dữ liệu đánh giá thực từ API, nên phần này đang để
                      placeholder.
                    </p>
                  </section>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-xl">
              <div className="space-y-8 p-8">
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-brand-800">
                      {formatPrice(courseDetail.price)}
                    </span>
                    <span className="text-base font-medium text-slate-400 line-through">
                      {formatPrice(courseDetail.price + 250000)}
                    </span>
                  </div>
                  <div className="inline-flex rounded-lg bg-brand-50 px-3 py-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                      Ưu đãi giới hạn
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => onCart()}
                    className="w-full rounded-2xl bg-brand-600 px-5 py-4 font-bold text-white transition hover:bg-brand-700"
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button className="w-full rounded-2xl border-2 border-brand-700 px-5 py-4 font-bold text-brand-700 transition hover:bg-brand-700 hover:text-white">
                    Mua ngay
                  </button>
                </div>

                <div className="space-y-4 border-t border-brand-100 pt-6 text-sm text-slate-600">
                  <p className="font-bold text-brand-900">
                    Khóa học này bao gồm:
                  </p>
                  <div className="space-y-3">
                    <div>• Truy cập trọn đời</div>
                    <div>• Học trên mọi thiết bị</div>
                    <div>• Tài liệu và source code mẫu</div>
                    <div>• Cập nhật theo phiên bản mới</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-6 text-center">
              <p className="mb-2 text-sm text-slate-600">
                Bạn cần tư vấn thêm?
              </p>
              <a
                href="/"
                className="text-sm font-bold text-brand-700 underline underline-offset-4"
              >
                Liên hệ hỗ trợ ngay
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-20 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-brand-800">
              Khóa học liên quan
            </h2>
            <a href="/" className="font-bold text-brand-600 hover:underline">
              Xem tất cả
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {fakeRelatedCourses?.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-800">
                    {item.level}
                  </span>
                </div>

                <div className="space-y-4 p-6">
                  <h4 className="line-clamp-2 text-xl font-bold text-slate-900">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between border-t border-brand-50 pt-4">
                    <span className="text-xl font-black text-brand-800">
                      {formatPrice(item.price)}
                    </span>
                    <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                      4.8 ★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative mt-20 overflow-hidden rounded-[2rem] bg-brand-700 px-8 py-14 text-center text-white shadow-2xl sm:px-12">
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl font-extrabold sm:text-5xl">
              Bắt đầu hành trình Backend ngay hôm nay
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-brand-50">
              Làm chủ NestJS và MongoDB qua dự án thực tế với mức giá ưu đãi.
            </p>
            <div className="pt-4">
              <button className="rounded-2xl bg-white px-10 py-4 font-black text-brand-700 transition hover:bg-brand-50">
                Đăng ký học ngay
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
