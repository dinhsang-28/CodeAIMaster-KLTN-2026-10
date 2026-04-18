import React, { useState } from "react";
import { Progress, Tag, Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Text } = Typography;

const courses = [
  { id: 1, title: "Python cơ bản đến nâng cao", tag: "Đang học", progress: 65, lessons: 24, total: 36 },
  { id: 2, title: "Machine Learning với Scikit-learn", tag: "Đang học", progress: 40, lessons: 12, total: 30 },
  { id: 3, title: "HTML & CSS hiện đại", tag: "Hoàn thành", progress: 100, lessons: 20, total: 20 },
  { id: 4, title: "JavaScript ES6+", tag: "Hoàn thành", progress: 100, lessons: 28, total: 28 },
  { id: 5, title: "React & Next.js", tag: "Đang học", progress: 30, lessons: 9, total: 30 },
  { id: 6, title: "Deep Learning với PyTorch", tag: "Chưa bắt đầu", progress: 0, lessons: 0, total: 40 },
];

const tagStyle: Record<string, { bg: string; color: string }> = {
  "Đang học": { bg: "#e8f0eb", color: "#2f5438" },
  "Hoàn thành": { bg: "#dff2e5", color: "#1a5c30" },
  "Chưa bắt đầu": { bg: "#f0f0f0", color: "#888" },
};

const progressColor: Record<string, string> = {
  "Đang học": "#4a7c59",
  "Hoàn thành": "#2f5438",
  "Chưa bắt đầu": "#ccc",
};

type Filter = "all" | "active" | "done";

const MyCourses = () => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = courses.filter((c) => {
    if (filter === "active") return c.tag === "Đang học";
    if (filter === "done") return c.tag === "Hoàn thành";
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-brand-900">Khóa học của tôi</h2>
        <div className="flex gap-2">
          {(["all", "active", "done"] as Filter[]).map((f) => {
            const label = f === "all" ? "Tất cả" : f === "active" ? "Đang học" : "Hoàn thành";
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? "#3d6b4a" : "white",
                  color: active ? "white" : "#3d6b4a",
                  border: active ? "none" : "0.5px solid #d4d1c3",
                  borderRadius: 10,
                  padding: "7px 16px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: active ? 500 : 400,
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:border-brand-200 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#e8f0eb",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOutlined style={{ color: "#3d6b4a", fontSize: 16 }} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: tagStyle[course.tag]?.bg,
                  color: tagStyle[course.tag]?.color,
                  fontWeight: 500,
                }}
              >
                {course.tag}
              </span>
            </div>

            <p className="text-sm font-semibold text-brand-900 mb-2 leading-snug">
              {course.title}
            </p>
            <p className="text-xs text-gray-400 mb-2.5">
              {course.lessons}/{course.total} bài học
            </p>

            <div style={{ background: "#e8e6da", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div
                style={{
                  background: progressColor[course.tag],
                  width: `${course.progress}%`,
                  height: "100%",
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <div className="text-right mt-1">
              <Text className="text-xs text-gray-400">{course.progress}%</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;