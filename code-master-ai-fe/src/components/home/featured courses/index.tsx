import React, { useEffect, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import AnimateOnScroll from "../../../utils/animateOnScroll";
import { ICourse } from "../../../api/enrollment";
import { GetFeaturedCourses } from "../../../api/course";
import { useNavigate } from "react-router-dom";

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<ICourse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetFeaturedCourses();
        setFeaturedCourses(data);
        console.log("Khóa học nổi bật: " + featuredCourses);
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
      className="w-full py-10 sm:py-16 bg-brand-50"
    >
      <AnimateOnScroll>
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-6 sm:gap-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl sm:text-2xl text-brand-700">
              <span>Khóa học</span> nổi bật
            </h2>
            <button
              type="button"
              onClick={() => navigate("/course")}
              className="font-medium text-brand-700 flex gap-2 items-center cursor-pointer text-sm sm:text-base bg-transparent border-none p-0 hover:opacity-90 active:scale-[0.98] transition"
            >
              Xem tất cả <ArrowRightOutlined />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
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
                className="rounded-2xl h-full bg-white shadow overflow-hidden flex flex-col hover:shadow-lg transition cursor-pointer"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                </div>

                <div className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-8 flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 w-max px-2 py-1 rounded-full">
                      {item.level}
                    </div>
                    <div className="font-bold text-base sm:text-lg text-brand-700 break-words">
                      {item.title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 break-words line-clamp-2">
                      {item.description}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t pt-4">
                    <div className="font-bold text-brand-600 text-sm sm:text-base">
                      {item.price.toLocaleString()} VND
                    </div>
                    <div className="text-xs sm:text-sm font-medium bg-brand-25 text-brand-700 px-3 py-1 rounded-full hover:bg-brand-200 pointer-events-none">
                      Xem chi tiết
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
