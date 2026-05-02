import { getMyCourses, ICourse } from "@/api/enrollment";
import React, { useEffect, useState } from "react";

const courses = [
  {
    id: 1,
    title: "Fullstack Web Development",
    instructor: "Trần Anh Quân",
    progress: 65,
    lessons: "12/18 bài học",
    category: "FULLSTACK",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2XBwH1yZvjSgAUWH75UleiZ_T2h-g_AMhsF3xk7ysFMxkoSQUU54uUaDU8qrETFf2oXFwPwFXc3Tlk3qp5IClXYJkgixJRNaeesUNuvlNbnNsnzQ-17X2icwWO25T5d593IySdahQO1K3NK7Pa--ZS_-XSIlHVBqb3dteXRuir9WfeSi95VT-jX9cOOkd6XGwzuNYJ9x_WEpDX14T_v1hi3IcK_Hww1Vmp7OG1tQD-XfLZITqYij2Ncqtj-DAE5m4Wcd7dHvPTu2H",
  },
  {
    id: 2,
    title: "Python for AI & Machine Learning",
    instructor: "Lê Minh Tâm",
    progress: 32,
    lessons: "8/25 bài học",
    category: "AI",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyfblfVYEaSFSDqGE36ksdvbVa2FBr_UGxKJS3QOgldOb30O7htMVFXwvm45wDUyyFoobJtCRv1aNYrTyxZS_7bupek17unvG5720rzaOX6myTOqdzaxwikrsDvgESfyXMV6N8NoJd9R8pJ3EVIZO94OSuVjZmb4jfsb8NFZ_uxWdkHyO5uBDA2PY1kD0ZR-bAruA-5DwQQ9MiUzwnp60weNFHDSSLX4fyCk_xPdf8yqctXT-JpG1Yu-AZLO5TQXwJ-6YMcLpTf7tB",
  },
  {
    id: 3,
    title: "Advanced UI/UX Masterclass",
    instructor: "Nguyễn Thu Hà",
    progress: 95,
    lessons: "19/20 bài học",
    category: "UI/UX",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAzF6tJ4u1KtjzqWVzzS-oEIRBY6qqy6eKIIG9aONG6iz-LL_d2MlL7vM_S4n0FuQ6WVT2P4ikPRJfR206tuI-jyQz0EmCpd-Jv4LI3zliHLLaD6lvfAWW17MjJTgDxx4VUkHuWVFSmBDVfkPbSeZL2Q4f4a4UXbD8pkeP6pHPnB55akTCkrQXV3dz5oGU7VUhxRobBa5F5-45eKYh0gQDv1VaMydE_1Ifmu9xxRoqSBNEPLCxBF8hYNh3UcjBjueiocx_oqpJPBLO",
  },
];

const MyCourses: React.FC = () => {
  const [coursesData, setCourses] = useState<ICourse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        const myCourseRes = await getMyCourses();
        setCourses(myCourseRes);
        console.log(myCourseRes);
        setCourses(myCourseRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, [getMyCourses]);
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
                  {/* <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-green-700 rounded-full"
                      // style={{ width: `${course.progress}%` }}
                    />
                  </div> */}
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

export default MyCourses;
