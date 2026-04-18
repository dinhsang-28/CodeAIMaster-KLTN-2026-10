import React from "react";
import { Input, Select, Button } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  CheckCircleOutlined,
  VideoCameraOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Option } = Select;

type Course = {
  id: number;
  name: string;
  updated: string;
  teacher: string;
  teacherAvatar: string;
  category: string;
  price: string;
  isFree?: boolean;
  status: "active" | "draft" | "inactive";
  image: string;
};

const courses: Course[] = [
  {
    id: 1,
    name: "ReactJS Masterclass 2024",
    updated: "2 ngày trước",
    teacher: "Trần Văn A",
    teacherAvatar: "https://i.pravatar.cc/40?img=11",
    category: "FRONTEND",
    price: "1,200,000đ",
    status: "active",
    image: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Node.js Backend Advanced",
    updated: "1 tuần trước",
    teacher: "Nguyễn Thị B",
    teacherAvatar: "https://i.pravatar.cc/40?img=5",
    category: "BACKEND",
    price: "1,500,000đ",
    status: "draft",
    image: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Machine Learning Foundations",
    updated: "3 ngày trước",
    teacher: "Lê Hoàng C",
    teacherAvatar: "https://i.pravatar.cc/40?img=7",
    category: "AI & DATA",
    price: "Miễn phí",
    isFree: true,
    status: "inactive",
    image: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: 4,
    name: "Python cho người mới bắt đầu",
    updated: "5 giờ trước",
    teacher: "Phạm Minh D",
    teacherAvatar: "https://i.pravatar.cc/40?img=9",
    category: "PROGRAMMING",
    price: "450,000đ",
    status: "active",
    image: "https://i.pravatar.cc/100?img=4",
  },
];

const stats = [
  {
    icon: <BookOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
    badge: "Tháng này",
    label: "Tổng khóa học",
    value: 128,
  },
  {
    icon: <CheckCircleOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
    badge: "Live",
    badgeColor: "#3a5a40",
    label: "Đang hoạt động",
    value: 94,
  },
  {
    icon: <VideoCameraOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
    badge: "Premium",
    label: "Khóa học trả phí",
    value: 82,
  },
  {
    icon: <TeamOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
    badge: "Community",
    label: "Khóa học miễn phí",
    value: 46,
  },
];

const StatusPill = ({ status }: { status: Course["status"] }) => {
  const map = {
    active: {
      dot: "#22c55e",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      text: "#166534",
      label: "Hoạt động",
    },
    draft: {
      dot: "#94a3b8",
      bg: "#f8fafc",
      border: "#e2e8f0",
      text: "#475569",
      label: "Bản nháp",
    },
    inactive: {
      dot: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
      text: "#991b1b",
      label: "Ngừng",
    },
  };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
};

const CategoryPill = ({ label }: { label: string }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 8px",
      borderRadius: 6,
      background: "#f1f5f9",
      color: "#475569",
      fontSize: 11,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

const ActionBtn = ({
  title,
  icon,
  danger,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      cursor: "pointer",
      border: danger ? "1px solid #fee2e2" : "1px solid #e2e8f0",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: danger ? "#ef4444" : "#64748b",
      transition: "all 0.15s",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = danger
        ? "#fef2f2"
        : "#f8fafc";
      if (!danger)
        (e.currentTarget as HTMLButtonElement).style.color = "#3a5a40";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "#fff";
      if (!danger)
        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
    }}
  >
    {icon}
  </button>
);

/* ─── Mobile card view for each course ─── */
const CourseCard = ({ course }: { course: Course }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 shadow-sm">
    <img
      src={course.image}
      alt={course.name}
      className="w-16 h-16 rounded-xl object-cover shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
          {course.name}
        </p>
        <StatusPill status={course.status} />
      </div>
      <p className="text-xs text-gray-400 mb-1">Cập nhật {course.updated}</p>
      <div className="flex items-center gap-2 mb-2">
        <img
          src={course.teacherAvatar}
          alt={course.teacher}
          className="w-5 h-5 rounded-full object-cover"
        />
        <span className="text-xs text-gray-600">{course.teacher}</span>
        <CategoryPill label={course.category} />
      </div>
      <div className="flex items-center justify-between">
        <span
          className="font-bold text-sm"
          style={{ color: course.isFree ? "#16a34a" : "#3a5a40" }}
        >
          {course.price}
        </span>
        <div className="flex gap-2">
          <ActionBtn
            title="Xem"
            icon={<EyeOutlined style={{ fontSize: 13 }} />}
          />
          <ActionBtn
            title="Sửa"
            icon={<EditOutlined style={{ fontSize: 13 }} />}
          />
          <ActionBtn
            title="Xóa"
            icon={<DeleteOutlined style={{ fontSize: 13 }} />}
            danger
          />
        </div>
      </div>
    </div>
  </div>
);

const CourseManage: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-700">
            Quản lý khóa học
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Theo dõi và quản lý nội dung các khóa học trên hệ thống.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((item, i) => (
            <div
              key={i}
              className="bg-brand-25 border border-brand-100 rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#f0f4f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: item.badgeColor ? "#3a5a40" : "#f1f5f9",
                    color: item.badgeColor ? "#fff" : "#475569",
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-700 mt-1">
                {item.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tên khóa học, giảng viên..."
              className="w-full sm:w-64"
              style={{ borderRadius: 999 }}
            />
            <div className="flex gap-2">
              <Select
                defaultValue="all"
                style={{ flex: 1, minWidth: 130, borderRadius: 8 }}
              >
                <Option value="all">Tất cả thể loại</Option>
                <Option value="frontend">Frontend</Option>
                <Option value="backend">Backend</Option>
                <Option value="ai">AI & Data</Option>
              </Select>
              <Select defaultValue="status" style={{ flex: 1, minWidth: 120 }}>
                <Option value="status">Trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="draft">Bản nháp</Option>
                <Option value="inactive">Ngừng</Option>
              </Select>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="w-full sm:w-auto"
            style={{
              background: "#3a5a40",
              borderColor: "#3a5a40",
              borderRadius: 999,
              fontWeight: 600,
              paddingLeft: 20,
              paddingRight: 20,
              height: 38,
            }}
          >
            Thêm khóa học
          </Button>
        </div>

        {/* Table (desktop) / Cards (mobile) */}
        {isMobile ? (
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-brand-25 border border-brand-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr
                    style={{
                      background: "#fafaf9",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {[
                      "THUMBNAIL",
                      "TÊN KHÓA HỌC",
                      "GIẢNG VIÊN",
                      "THỂ LOẠI",
                      "GIÁ",
                      "TRẠNG THÁI",
                      "THAO TÁC",
                    ].map((col, i) => (
                      <th
                        key={col}
                        className="p-4 text-left text-gray-500"
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textAlign: i === 6 ? "right" : "left",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, idx) => (
                    <tr
                      key={course.id}
                      style={{
                        borderTop: idx === 0 ? "none" : "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafaf9")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td className="p-4">
                        <img
                          src={course.image}
                          alt={course.name}
                          style={{
                            width: 64,
                            height: 44,
                            borderRadius: 10,
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">
                          {course.name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          Cập nhật {course.updated}
                        </p>
                      </td>
                      <td className="p-4">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <img
                            src={course.teacherAvatar}
                            alt={course.teacher}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: "#374151" }}>
                            {course.teacher}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <CategoryPill label={course.category} />
                      </td>
                      <td className="p-4">
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: course.isFree ? "#16a34a" : "#3a5a40",
                          }}
                        >
                          {course.price}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusPill status={course.status} />
                      </td>
                      <td className="p-4" style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <ActionBtn
                            title="Xem"
                            icon={<EyeOutlined style={{ fontSize: 14 }} />}
                          />
                          <ActionBtn
                            title="Sửa"
                            icon={<EditOutlined style={{ fontSize: 14 }} />}
                          />
                          <ActionBtn
                            title="Xóa"
                            icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderTop: "1px solid #f1f5f9",
                background: "#fafaf9",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span
                className="text-gray-500"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                HIỂN THỊ 4 TRÊN 128 KHÓA HỌC
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {["Trước", "1", "2", "3", "Tiếp"].map((p) => (
                  <button
                    key={p}
                    style={{
                      minWidth: 36,
                      height: 36,
                      padding: "0 10px",
                      borderRadius: 8,
                      border: p === "1" ? "none" : "1px solid #e2e8f0",
                      background: p === "1" ? "#3a5a40" : "#fff",
                      color: p === "1" ? "#fff" : "#374151",
                      fontWeight: p === "1" ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile pagination */}
        {isMobile && (
          <div className="flex justify-center gap-2 pt-2">
            {["Trước", "1", "2", "3", "Tiếp"].map((p) => (
              <button
                key={p}
                style={{
                  minWidth: 36,
                  height: 36,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: p === "1" ? "none" : "1px solid #e2e8f0",
                  background: p === "1" ? "#3a5a40" : "#fff",
                  color: p === "1" ? "#fff" : "#374151",
                  fontWeight: p === "1" ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManage;
