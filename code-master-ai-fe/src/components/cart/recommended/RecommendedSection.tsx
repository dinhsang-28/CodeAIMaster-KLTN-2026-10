import React from "react";
import RecommendedCard from "./RecommendedCard";

export interface RecommendedCourse {
  id: string;
  title: string;
  price: string;
  image: string;
  level?: string;
}

interface RecommendedSectionProps {
  courses: RecommendedCourse[];
}

export default function RecommendedSection({
  courses,
}: RecommendedSectionProps) {
  if (courses.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#3a473c] mb-6">Khóa học gợi ý</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <RecommendedCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
