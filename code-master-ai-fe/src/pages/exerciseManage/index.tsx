import React, { useState, useEffect } from "react";
import { Input, Button, Modal as AntdModal, message, Spin, Pagination } from "antd";
import {
  SearchOutlined, PlusOutlined, EditOutlined, MoreOutlined, DeleteOutlined,
  FilterOutlined, DownloadOutlined, CalendarOutlined, RocketOutlined,
  MailOutlined, BellOutlined, BarChartOutlined, LeftOutlined, RightOutlined,
  RobotOutlined
} from "@ant-design/icons";

import { 
  searchAssignments, deleteAssignment,
  getQuizzesByAssignmentId, deleteQuiz, getQuestionsByQuizId, deleteQuestion,
  getCodeAssignmentsByAssignmentId, deleteCodeAssignment, getTestcasesByCodeAssignmentId, deleteTestcase
} from "../../api/excersice";
import { searchCourses, getCourseFullInfo } from "../../api/course";

import AssignmentFormModal from "../../components/Modals/AssignmentFormModal";
import TestcaseManagerModal from "../../components/Modals/TestcaseManagerModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const TABS = ["Bài tập thường", "Code Assignment", "Ngân hàng câu hỏi"];

const StatusPill = ({ status }: { status: "open" | "closed" }) =>
  status === "open" ? (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 6, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>OPEN</span>
  ) : (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 6, background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>CLOSED</span>
  );

const ExerciseManage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: quiz, 1: codeAssignment, 2: questions
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);

  // Modals
  const [asgModalVisible, setAsgModalVisible] = useState(false);
  const [asgModalMode, setAsgModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentAsg, setCurrentAsg] = useState<any>(null);

  const [tcModalVisible, setTcModalVisible] = useState(false);
  const [currentCodeAsgId, setCurrentCodeAsgId] = useState<string>("");

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setPage(1); // Reset trang khi đổi tab hoặc đổi keyword
  }, [activeTab, debouncedKeyword]);

  useEffect(() => {
    if (activeTab === 0 || activeTab === 1) {
      fetchAssignments();
    } else {
      // Tab 2: Ngân hàng câu hỏi - mock logic empty
      setAssignments([]);
      setTotal(0);
    }
  }, [page, limit, debouncedKeyword, activeTab]);

  const fetchCourses = async () => {
    try {
      const res = await searchCourses({ limit: 100 });
      setCourses(Array.isArray(res) ? res : res.courses || res.results || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const type = activeTab === 0 ? "quiz" : "codeAssignment";
      const res = await searchAssignments({ page, limit, keyword: debouncedKeyword, type });
      const dataList = Array.isArray(res) ? res : res?.assignments || res?.results || res?.data || [];
      setAssignments(dataList);
      setTotal(res?.totalAssignments || res?.total || dataList.length || 0);
    } catch (e) {
      message.error("Lỗi khi lấy danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (activeTab === 2) {
      message.info("Tính năng ngân hàng câu hỏi đang phát triển.");
      return;
    }
    setAsgModalMode("create");
    setCurrentAsg(null);
    setAsgModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setCurrentAsg(record);
    setAsgModalMode("edit");
    setAsgModalVisible(true);
  };

  const handleView = (record: any) => {
    setCurrentAsg(record);
    setAsgModalMode("view");
    setAsgModalVisible(true);
  };

  const handleManageTestcases = async (assignment: any) => {
    setLoading(true);
    try {
      const codeAsgs = await getCodeAssignmentsByAssignmentId(assignment._id);
      if (codeAsgs && codeAsgs.length > 0) {
        setCurrentCodeAsgId(codeAsgs[0]._id);
        setTcModalVisible(true);
      } else {
        message.warning("Bài tập này chưa có Code Assignment map nào!");
      }
    } catch (e) {
      message.error("Lỗi hệ thống khi tìm Code Assignment");
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignmentSafely = async (assignmentId: string, type: string) => {
    if (type === 'quiz') {
      const quizzes = await getQuizzesByAssignmentId(assignmentId);
      for (const quiz of quizzes) {
        const questions = await getQuestionsByQuizId(quiz._id);
        for (const q of questions) await deleteQuestion(q._id);
        await deleteQuiz(quiz._id);
      }
    } else if (type === 'codeAssignment') {
      const codeAsgs = await getCodeAssignmentsByAssignmentId(assignmentId);
      for (const ca of codeAsgs) {
        const testcases = await getTestcasesByCodeAssignmentId(ca._id);
        for (const tc of testcases) await deleteTestcase(tc._id);
        await deleteCodeAssignment(ca._id);
      }
    }
    await deleteAssignment(assignmentId);
  };

  const handleDelete = (record: any) => {
    AntdModal.confirm({
      title: "Xóa bài tập",
      content: "Bạn có chắc chắn muốn xóa bài tập này? Mọi dữ liệu liên quan (câu hỏi, testcases) cũng sẽ bị xóa vĩnh viễn.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await deleteAssignmentSafely(record._id, record.type);
          message.success("Xóa bài tập thành công");
          fetchAssignments();
        } catch (e) {
          message.error("Xóa thất bại");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const statItems = [
    { icon: <CalendarOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#3a5a40", badge: "Hệ thống", badgeBg: "#f0fdf4", badgeColor: "#166534", label: "TỔNG BÀI TẬP", value: total || assignments.length },
    { icon: <RocketOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#588157", badge: "Hoạt động", badgeBg: "#f0fdf4", badgeColor: "#166534", label: "TRANG HIỆN TẠI", value: assignments.length },
    { icon: <MailOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#3a5a40", badge: "Loại bài tập", badgeBg: "#f1f5f9", badgeColor: "#475569", label: "CODE ASG", value: activeTab === 1 ? assignments.length : "N/A" },
    { icon: <BellOutlined style={{ fontSize: 22, color: "#fff" }} />, iconBg: "#ef4444", badge: "Yêu cầu mới", badgeBg: "#fef2f2", badgeColor: "#991b1b", label: "QUIZZES", value: activeTab === 0 ? assignments.length : "N/A" },
  ];

  const getCourseName = (c: any) => c?.title || c?.name || "Chưa có khóa học";
  const getLessonName = (l: any) => l?.title || l?.name || "Không thuộc bài học";

  const AssignmentCard = ({ item }: { item: any }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-800 text-sm leading-tight">{item.name || item.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">ID: {item._id}</p>
        </div>
        <StatusPill status={item.status || "open"} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Khóa học</p>
          <p className="font-medium text-gray-700 line-clamp-2">{getCourseName(item.course)}</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Bài học</p>
          <p className="font-medium text-gray-700 line-clamp-2">{getLessonName(item.lesson)}</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Hạn nộp</p>
          <p className="font-medium text-gray-700">
            {item.dueDate ? new Date(item.dueDate).toLocaleDateString("vi-VN") : "Không có hạn"}
          </p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Điểm tối đa</p>
          <p className="font-bold text-green-700">{item.score || 10}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-1 border-t border-gray-100 gap-2">
        {activeTab === 1 && (
          <Button size="small" type="dashed" icon={<RobotOutlined/>} onClick={() => handleManageTestcases(item)}>Testcases</Button>
        )}
        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)} />
        <Button size="small" danger icon={<MoreOutlined />} onClick={() => handleDelete(item)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <Spin spinning={loading} size="large">
        <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-700">Quản lý bài tập</h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Quản lý và theo dõi tiến độ bài tập của học viên</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}
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
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
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
          {activeTab === 2 ? (
            <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-lg">Chưa có dữ liệu Ngân hàng câu hỏi.</div>
          ) : isMobile ? (
            <div className="space-y-3">
              {assignments.map((item) => <AssignmentCard key={item._id} item={item} />)}
              {assignments.length === 0 && <div className="text-center py-6 text-gray-400">Không có bài tập nào</div>}
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
                    {assignments.map((item, idx) => (
                      <tr key={item._id} style={{ borderTop: idx === 0 ? "none" : "1px solid #f1f5f9", transition: "background 0.12s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafaf9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "16px" }}>
                          <p style={{ fontWeight: 700, color: "#1e293b", fontSize: 14, marginBottom: 4 }}>{item.name || item.title}</p>
                        </td>
                        <td style={{ padding: "16px", fontSize: 13, color: "#374151" }}>{getCourseName(item.course)}</td>
                        <td style={{ padding: "16px", fontSize: 13, color: "#374151" }}>{getLessonName(item.lesson)}</td>
                        <td style={{ padding: "16px", textAlign: "center", fontWeight: 800, fontSize: 15, color: "#3a5a40" }}>{item.score || 10}</td>
                        <td style={{ padding: "16px" }}>
                          <p style={{ fontSize: 13, color: "#374151" }}>
                            {item.dueDate ? new Date(item.dueDate).toLocaleDateString("vi-VN") : "Không có hạn"}
                          </p>
                          {item.dueTime && <p style={{ fontSize: 12, color: "#94a3b8" }}>{item.dueTime}</p>}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}><StatusPill status={item.status || "open"} /></td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            {activeTab === 1 && (
                              <button onClick={() => handleManageTestcases(item)} style={{ padding: '0 8px', height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f0fdf4", color: "#166534", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                                <RobotOutlined /> Testcases
                              </button>
                            )}
                            <button onClick={() => handleEdit(item)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                              <EditOutlined style={{ fontSize: 14 }} />
                            </button>
                            <button onClick={() => handleDelete(item)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", cursor: "pointer" }}>
                              <DeleteOutlined style={{ fontSize: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {assignments.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-6 text-gray-400">Không có bài tập nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fafaf9", flexWrap: "wrap", gap: 8 }}>
                  <span className="text-gray-500" style={{ fontSize: 13 }}>Hiển thị {assignments.length} trên {total} bài tập</span>
                  <Pagination size="small" current={page} pageSize={limit} total={total} onChange={(p) => setPage(p)} />
                </div>
              )}
            </div>
          )}

          {/* Bottom Info Card */}
          <div className="rounded-2xl p-6 sm:p-8 text-white mt-4" style={{ background: "linear-gradient(135deg, #3a5a40 0%, #588157 100%)" }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Thông tin hệ thống</h4>
            <p style={{ fontSize: 14, opacity: 0.82, lineHeight: 1.6, maxWidth: 480 }}>
              Bạn đang xem danh sách các bài tập của loại "{activeTab === 0 ? 'Bài tập thường' : activeTab === 1 ? 'Code Assignment' : 'Ngân hàng câu hỏi'}". Để quản lý testcase cho code assignment, hãy bấm vào nút Testcases tương ứng.
            </p>
          </div>
        </div>
      </Spin>

      {asgModalVisible && (
        <AssignmentFormModal
          visible={asgModalVisible}
          mode={asgModalMode}
          initialData={currentAsg}
          type={activeTab === 0 ? "quiz" : "codeAssignment"}
          courses={courses}
          getCourseFullInfo={getCourseFullInfo}
          onCancel={() => setAsgModalVisible(false)}
          onSuccess={() => { setAsgModalVisible(false); fetchAssignments(); }}
        />
      )}

      {tcModalVisible && (
        <TestcaseManagerModal
          visible={tcModalVisible}
          codeAssignmentId={currentCodeAsgId}
          onCancel={() => setTcModalVisible(false)}
        />
      )}

    </div>
  );
};

export default ExerciseManage;