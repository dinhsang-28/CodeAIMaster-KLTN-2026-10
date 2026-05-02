import { getMyCourses, ICourse } from "../../api/enrollment";
import React, { useEffect, useState } from "react";

const MyEnrollment: React.FC = () => {
  const [coursesData, setCourses] = useState<ICourse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-8 max-w-[1440px] mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">
            Khóa học của tôi
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant">
            Chào mừng bạn quay trở lại, hãy tiếp tục hành trình chinh phục tri
            thức.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-12 mb-8 max-w-[1440px] mx-auto">
        <div className="flex flex-wrap gap-2 p-1 bg-surface-container w-fit rounded-xl">
          <button className="px-5 sm:px-8 py-2 rounded-lg text-sm font-semibold bg-white text-primary shadow">
            Tất cả
          </button>
          <button className="px-5 sm:px-8 py-2 rounded-lg text-sm text-on-surface-variant hover:text-primary">
            Đang học
          </button>
          <button className="px-5 sm:px-8 py-2 rounded-lg text-sm text-on-surface-variant hover:text-primary">
            Hoàn thành
          </button>
        </div>
      </section>

      {/* Course List */}
      <section className="px-4 sm:px-6 lg:px-12 pb-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {coursesData.map((course) => (
            <div
              key={course._id}
              className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {course.category.category_name}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                  {course.title}
                </h3>

                {/* <p className="text-sm text-gray-500 mb-4">
                  Giảng viên: {course.instructor}
                </p> */}

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>Tiến độ:65%</span>
                    <span>"12/18 bài học",</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-700 rounded-full"
                      style={{ width: `${10}%` }}
                    />
                  </div>
                </div>

                {/* Button */}
                <button className="w-full py-3 sm:py-4 bg-gradient-to-r from-green-900 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition">
                  Vào học ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default MyEnrollment;
