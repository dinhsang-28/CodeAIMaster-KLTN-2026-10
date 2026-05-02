import React from "react";
export default function MyCourses() {
  return (
    <div className="bg-[#fdf9ef] min-h-screen px-12 py-16">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-[#23422a] mb-3">
          Khóa học của tôi
        </h1>
        <p className="text-lg text-[#424842]">
          Chào mừng bạn quay trở lại, hãy tiếp tục hành trình chinh phục tri thức.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-12 bg-[#e6e2d8] p-1 rounded-xl w-fit">
        <button className="px-6 py-2 rounded-lg bg-white shadow text-[#23422a] font-semibold">
          Tất cả
        </button>
        <button className="px-6 py-2 text-[#424842]">Đang học</button>
        <button className="px-6 py-2 text-[#424842]">Hoàn thành</button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-[#ffffff] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
          >
            {/* Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                className="w-full h-52 object-cover"
              />

              <span className="absolute top-4 left-4 bg-[#ccead8] text-[#23422a] text-xs font-bold px-3 py-1 rounded-full">
                FULLSTACK
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#23422a] mb-1">
                Fullstack Web Development
              </h3>

              <p className="text-sm text-[#424842] mb-4">
                Giảng viên: Trần Anh Quân
              </p>

              {/* Progress */}
              <div className="flex justify-between text-sm mb-1 text-[#23422a] font-medium">
                <span>Tiến độ: 65%</span>
                <span>12/18 bài học</span>
              </div>

              <div className="w-full h-2 bg-[#e6e2d8] rounded-full mb-6">
                <div className="w-[65%] h-full bg-[#23422a] rounded-full"></div>
              </div>

              <button className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#23422a] to-[#3a5a40]">
                Vào học ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}