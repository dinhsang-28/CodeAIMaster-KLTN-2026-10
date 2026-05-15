import React, { useEffect, useState } from "react";
import { ArrowRightOutlined, BookOutlined } from "@ant-design/icons";
import AnimateOnScroll from "../../../utils/animateOnScroll";
import { ICourse } from "../../../api/enrollment";
import { GetFeaturedCourses } from "../../../api/course";
import { useNavigate } from "react-router-dom";

type FeaturedCourse = ICourse & {
  totalEnrollments?: number;
};

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetFeaturedCourses();
        setFeaturedCourses(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);
  return (
    <section
      id="tour-featured-courses"
      className="w-full bg-brand-50 py-12 sm:py-16"
    >
      <AnimateOnScroll>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-500">
                Được học viên lựa chọn
              </p>
              <h2 className="text-2xl font-black text-brand-800 sm:text-3xl">
                Khóa học nổi bật
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/course")}
              className="flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm transition hover:border-brand-400 hover:bg-brand-25 active:scale-[0.98]"
            >
              Xem tất cả <ArrowRightOutlined />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((item) => (
              <div
                key={item._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/course/${item._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/course/${item._id}`);
                  }
                }}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase text-brand-800">
                      {item.category?.category_name || "Khóa học"}
                    </span>
                    <span className="rounded-full bg-brand-600 px-3 py-1 text-[10px] font-extrabold uppercase text-white">
                      {item.level}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-5 p-5">
                  <div className="flex flex-col gap-2">
                    <div className="line-clamp-2 min-h-[3.5rem] text-lg font-extrabold leading-7 text-brand-800">
                      {item.title}
                    </div>
                    <div className="line-clamp-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-brand-50 pt-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand-500">
                      <BookOutlined />
                      <span>{item.totalEnrollments || 0} học viên</span>
                    </div>
                    <div className="text-base font-black text-brand-700">
                      {Number(item.price || 0) === 0
                        ? "Miễn phí"
                        : `${Number(item.price || 0).toLocaleString("vi-VN")}đ`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
};

export default FeaturedCourses;
