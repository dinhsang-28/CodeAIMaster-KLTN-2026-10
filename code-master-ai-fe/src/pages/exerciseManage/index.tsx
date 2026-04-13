import React, { useState } from "react";
import { Input, Button } from "antd";
import {
  SearchOutlined, PlusOutlined, EditOutlined, MoreOutlined,
  FilterOutlined, DownloadOutlined, CalendarOutlined, RocketOutlined,
  MailOutlined, BellOutlined, BarChartOutlined, LeftOutlined, RightOutlined,
} from "@ant-design/icons";

type Assignment = {
  id: string;
  name: string;
  course: string;
  lesson: string;
  score: number;
  dueDate: string;
  dueTime: string;
  submissions: number;
  submissionsTotal: number;
  isOverdue?: boolean;
  status: "open" | "closed";
};

const data: Assignment[] = [
  { id: "#ASG-001", name: "Cấu trúc điều kiện IF/ELSE", course: "Lập trình Python Cơ Bản", lesson: "Bài 4: Luồng xử lý", score: 100, dueDate: "25/10/2023", dueTime: "23:59", submissions: 142, submissionsTotal: 150, status: "open" },
  { id: "#ASG-002", name: "Thao tác với Array cơ bản", course: "JavaScript Hiện Đại", lesson: "Bài 6: Data Structures", score: 10, dueDate: "20/10/2023", dueTime: "23:59", submissions: 98, submissionsTotal: 100, status: "closed" },
  { id: "#ASG-003", name: "Xây dựng UI với Flexbox", course: "HTML & CSS Master", lesson: "Bài 12: Layout Mastery", score: 50, dueDate: "15/10/2023", dueTime: "23:59", submissions: 45, submissionsTotal: 200, isOverdue: true, status: "closed" },
  { id: "#ASG-004", name: "Phân tích thuật toán Sắp xếp", course: "Cấu trúc dữ liệu & Giải thuật", lesson: "Bài 2: Sorting Algorithms", score: 100, dueDate: "30/11/2023", dueTime: "23:59", submissions: 12, submissionsTotal: 80, status: "open" },
];

const TABS = ["Bài tập thường", "Code Assignment", "Ngân hàng câu hỏi"];

const StatusPill = ({ status }: { status: "open" | "closed" }) =>
  status === "open" ? (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>OPEN</span>
  ) : (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 6, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>CLOSED</span>
  );

/* ─── Mobile card for each assignment ─── */
const AssignmentCard = ({ item }: { item: Assignment }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">ID: {item.id}</p>
      </div>
      <StatusPill status={item.status} />
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
      <div>
        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Khóa học</p>
        <p className="font-medium text-gray-700 line-clamp-2">{item.course}</p>
      </div>
      <div>
        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Bài học</p>
        <p className="font-medium text-gray-700 line-clamp-2">{item.lesson}</p>
      </div>
      <div>
        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Hạn nộp</p>
        <p className={`font-medium ${item.isOverdue ? "text-red-500 font-bold" : "text-gray-700"}`}>
          {item.isOverdue ? "Hết hạn" : item.dueDate}
        </p>
      </div>
      <div>
        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Nộp bài</p>
        <p className="font-bold" style={{ color: item.submissions / item.submissionsTotal < 0.4 ? "#ef4444" : "#374151" }}>
          {item.submissions}<span className="text-gray-400 font-normal">/{item.submissionsTotal}</span>
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
      <div>
        <span className="text-xs text-gray-400">Điểm tối đa: </span>
        <span className="font-extrabold text-sm" style={{ color: "#3a5a40" }}>{item.score}</span>
      </div>
      <div className="flex gap-2">
        {[EditOutlined, MoreOutlined].map((Icon, i) => (
          <button key={i} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
          >
            <Icon style={{ fontSize: 13 }} />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ExerciseManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const statItems = [
    { icon: <CalendarOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#3a5a40", badge: "+12 tháng này", badgeBg: "#f0fdf4", badgeColor: "#166534", label: "TỔNG BÀI TẬP", value: "124" },
    { icon: <RocketOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#588157", badge: "Hoạt động", badgeBg: "#f0fdf4", badgeColor: "#166534", label: "ĐANG MỞ (OPEN)", value: "86" },
    { icon: <MailOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#3a5a40", badge: "89% hoàn thành", badgeBg: "#f1f5f9", badgeColor: "#475569", label: "LƯỢT NỘP BÀI", value: "2,451" },
    { icon: <BellOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#ef4444", badge: "Yêu cầu mới", badgeBg: "#fef2f2", badgeColor: "#991b1b", label: "CẦN CHẤM ĐIỂM", value: "12" },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-700">Quản lý bài tập</h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Quản lý và theo dõi tiến độ bài tập của học viên</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />}
            className="w-full sm:w-auto"
            style={{ background: "#3a5a40", borderColor: "#3a5a40", borderRadius: 999, fontWeight: 600, height: 40, paddingLeft: 20, paddingRight: 20, fontSize: 14 }}
          >
            Tạo bài tập mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((s, i) => (
            <div key={i} className="flex flex-col justify-center border border-brand-100 rounded-2xl bg-brand-25 shadow-sm px-4 sm:px-8 py-5 sm:py-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: s.badgeBg, color: s.badgeColor, whiteSpace: "nowrap" }}>
                  {s.badge}
                </span>
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto" style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 0, minWidth: "max-content" }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: activeTab === i ? "2px solid #3a5a40" : "2px solid transparent", color: activeTab === i ? "#3a5a40" : "#64748b", fontWeight: activeTab === i ? 700 : 500, fontSize: 13, cursor: "pointer", marginBottom: -1, whiteSpace: "nowrap" }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Tìm kiếm bài tập..."
            className="w-full sm:w-72"
            style={{ borderRadius: 8, height: 38 }}
          />
          <div className="flex gap-2">
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              <FilterOutlined style={{ fontSize: 13 }} /> LỌC
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
              <DownloadOutlined style={{ fontSize: 15 }} />
            </button>
          </div>
        </div>

        {/* Table (desktop) / Cards (mobile) */}
        {isMobile ? (
          <div className="space-y-3">
            {data.map((item) => <AssignmentCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="border border-brand-100 bg-brand-25 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {[
                      { label: "TÊN BÀI TẬP", align: "left" },
                      { label: "KHÓA HỌC", align: "left" },
                      { label: "BÀI HỌC", align: "left" },
                      { label: "ĐIỂM", align: "center" },
                      { label: "HẠN NỘP", align: "left" },
                      { label: "NỘP BÀI", align: "center" },
                      { label: "TRẠNG THÁI", align: "center" },
                      { label: "THAO TÁC", align: "right" },
                    ].map((col) => (
                      <th key={col.label} className="text-gray-500"
                        style={{ padding: "14px 16px", textAlign: col.align as any, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", background: "#fafaf9" }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.id} style={{ borderTop: idx === 0 ? "none" : "1px solid #f1f5f9", transition: "background 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <p style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, marginBottom: 4 }}>{item.name}</p>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>ID: {item.id}</span>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#374151" }}>{item.course}</td>
                      <td style={{ padding: "16px", fontSize: 13, color: "#374151" }}>{item.lesson}</td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: 800, fontSize: 15, color: "#3a5a40" }}>{item.score}</td>
                      <td style={{ padding: "16px" }}>
                        <p style={{ fontSize: 13, color: item.isOverdue ? "#ef4444" : "#374151", fontWeight: item.isOverdue ? 700 : 400 }}>
                          {item.isOverdue ? "Hết hạn" : item.dueDate}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8" }}>{item.dueTime}</p>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: item.submissions / item.submissionsTotal < 0.4 ? "#ef4444" : "#374151" }}>
                          {item.submissions}
                        </p>
                        <p style={{ fontSize: 11, color: "#94a3b8" }}>/{item.submissionsTotal} học viên</p>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}><StatusPill status={item.status} /></td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          {[EditOutlined, MoreOutlined].map((Icon, i) => (
                            <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                            >
                              <Icon style={{ fontSize: 14 }} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fafaf9", flexWrap: "wrap", gap: 8 }}>
              <span className="text-gray-500" style={{ fontSize: 13 }}>Hiển thị 4 trên 124 bài tập</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
                  <LeftOutlined style={{ fontSize: 11 }} />
                </button>
                {[1, 2, 3].map((p) => (
                  <button key={p} onClick={() => setActivePage(p)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: activePage === p ? "none" : "1px solid #e2e8f0", background: activePage === p ? "#3a5a40" : "#fff", color: activePage === p ? "#fff" : "#374151", fontWeight: activePage === p ? 700 : 500, fontSize: 13, cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
                <span style={{ color: "#94a3b8", padding: "0 4px" }}>...</span>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontSize: 13, cursor: "pointer" }}>31</button>
                <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
                  <RightOutlined style={{ fontSize: 11 }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile pagination */}
        {isMobile && (
          <div className="flex justify-center gap-2">
            <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
              <LeftOutlined style={{ fontSize: 11 }} />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} onClick={() => setActivePage(p)}
                style={{ width: 32, height: 32, borderRadius: 8, border: activePage === p ? "none" : "1px solid #e2e8f0", background: activePage === p ? "#3a5a40" : "#fff", color: activePage === p ? "#fff" : "#374151", fontWeight: activePage === p ? 700 : 500, fontSize: 13, cursor: "pointer" }}>
                {p}
              </button>
            ))}
            <button style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}>
              <RightOutlined style={{ fontSize: 11 }} />
            </button>
          </div>
        )}

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 rounded-2xl p-6 sm:p-8 text-white"
            style={{ background: "linear-gradient(135deg, #3a5a40 0%, #588157 100%)" }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Thông tin hệ thống</h4>
            <p style={{ fontSize: 14, opacity: 0.82, lineHeight: 1.6, marginBottom: 24, maxWidth: 480 }}>
              Bạn đang xem danh sách các bài tập tiểu luận và trắc nghiệm. Để quản lý các bài tập chấm code tự động, hãy chuyển sang tab Code Assignment.
            </p>
            <button className="w-full sm:w-auto"
              style={{ padding: "10px 22px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.7)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              Tìm hiểu về Code Assignment
            </button>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChartOutlined style={{ fontSize: 26, color: "#3a5a40" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>Tỷ lệ hoàn thành</p>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Dựa trên toàn bộ học viên đăng ký</p>
            </div>
            <div style={{ width: "100%" }}>
              <div style={{ height: 10, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "82%", background: "linear-gradient(90deg, #588157, #3a5a40)", borderRadius: 999 }} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#3a5a40" }}>82%</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExerciseManage;