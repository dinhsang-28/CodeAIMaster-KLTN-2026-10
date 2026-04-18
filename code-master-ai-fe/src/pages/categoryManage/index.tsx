import React from "react";
import {
  Plus,
  Code2,
  Database,
  Brain,
  Smartphone,
  Shield,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";

type CategoryItem = {
  id: number;
  title: string;
  description: string;
  courseCount: number;
  icon: React.ReactNode;
};

const categories: CategoryItem[] = [
  {
    id: 1,
    title: "Frontend Development",
    description: "React, Vue, NextJS, Tailwind CSS...",
    courseCount: 24,
    icon: <Code2 className="w-8 h-8" />,
  },
  {
    id: 2,
    title: "Backend Development",
    description: "Node.js, Python, PostgreSQL, Go...",
    courseCount: 18,
    icon: <Database className="w-8 h-8" />,
  },
  {
    id: 3,
    title: "AI & Data Science",
    description: "Machine Learning, LLMs, Pandas...",
    courseCount: 12,
    icon: <Brain className="w-8 h-8" />,
  },
  {
    id: 4,
    title: "Mobile Development",
    description: "Flutter, React Native, Swift...",
    courseCount: 9,
    icon: <Smartphone className="w-8 h-8" />,
  },
  {
    id: 5,
    title: "Cyber Security",
    description: "Ethical Hacking, Network Security...",
    courseCount: 6,
    icon: <Shield className="w-8 h-8" />,
  },
];

const stats = [
  {
    label: "Tổng số thể loại",
    value: "12",
  },
  {
    label: "Thể loại hoạt động",
    value: "08",
  },
  {
    label: "Khóa học nhiều nhất",
    value: "Frontend Dev",
  },
  {
    label: "Cập nhật cuối",
    value: "2 giờ trước",
  },
];


const CategoryManage : React.FC = () =>{
    const handleAddCategory = () => {
    console.log("Add new category");
  };

  const handleEdit = (id: number) => {
    console.log("Edit category:", id);
  };

  const handleDelete = (id: number) => {
    console.log("Delete category:", id);
  };

  return (
    <div className="min-h-screen bg-[#e8fff0] px-8 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#062015]">
              Quản lý thể loại
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-[#424842]">
              Tổ chức và phân loại các nội dung giáo dục của hệ thống CodeMaster AI.
            </p>
          </div>

          <button
            onClick={handleAddCategory}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#23422a] to-[#3a5a40] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Thêm thể loại mới
          </button>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/60 bg-[#ddfbe9] p-6 shadow-sm"
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5f665f]">
                {stat.label}
              </p>
              <p className="truncate text-2xl font-black text-[#23422a]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-[24px] border border-transparent bg-white p-8 shadow-[0px_10px_30px_rgba(6,32,21,0.03)] transition-all duration-300 hover:border-[#c7ecca] hover:shadow-xl"
            >
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#23422a]/5 transition-transform group-hover:scale-110" />

              <div className="relative z-10 mb-8 flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c7ecca] text-[#23422a] transition-all duration-300 group-hover:bg-[#23422a] group-hover:text-white">
                  {category.icon}
                </div>

                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="rounded-lg p-2 transition hover:bg-[#beecb9]"
                  >
                    <Pencil className="h-5 w-5 text-[#23422a]" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-lg p-2 transition hover:bg-[#ffdad6]"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="mb-2 text-2xl font-bold text-[#062015]">
                  {category.title}
                </h3>
                <p className="text-sm font-medium text-[#424842]">
                  {category.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <span className="rounded-full bg-[#ddfbe9] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#23422a]">
                    {category.courseCount} Khóa học
                  </span>

                  <ArrowRight className="h-5 w-5 text-[#23422a]/40 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}

          {/* Add new placeholder */}
          <button
            onClick={handleAddCategory}
            className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c2c8bf] p-8 text-center transition hover:border-[#23422a]/50"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ddfbe9] text-[#23422a] transition-transform group-hover:scale-110">
              <Plus className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-[#062015]">Tạo thể loại mới</h3>
            <p className="mt-2 text-sm text-[#424842]">
              Mở rộng danh mục đào tạo của bạn
            </p>
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-col gap-4 border-t border-[#c2c8bf]/30 pt-8 text-[#424842] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            Hệ thống hoạt động ổn định
          </div>

          <div className="flex gap-6">
            <button className="text-xs font-bold uppercase tracking-widest transition hover:text-[#23422a]">
              Hướng dẫn
            </button>
            <button className="text-xs font-bold uppercase tracking-widest transition hover:text-[#23422a]">
              Báo cáo lỗi
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default CategoryManage;