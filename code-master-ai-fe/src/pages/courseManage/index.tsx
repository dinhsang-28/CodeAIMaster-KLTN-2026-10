import React, { useState, useEffect } from "react";
import { Input, Select, Button, Modal as AntdModal, message, Spin, Pagination } from "antd";
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
import { searchCourses, deleteCourse, getCourseFullInfo, GetCategories } from "../../api/course";
import CourseFormModal from "../../components/Modals/CourseFormModal";

const { Option } = Select;

// Custom Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type Course = {
  _id: string;
  name?: string;
  title?: string;
  updatedAt?: string;
  instructor?: any;
  category?: any;
  price?: number | string;
  isFree?: boolean;
  status?: "active" | "draft" | "inactive";
  thumbnail?: string;
  [key: string]: any;
};

const StatusPill = ({ status }: { status?: Course["status"] }) => {
  const sStatus = status || "active";
  const map: Record<string, any> = {
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
  const s = map[sStatus] || map["active"];
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
      if (!danger) (e.currentTarget as HTMLButtonElement).style.color = "#3a5a40";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "#fff";
      if (!danger) (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
    }}
  >
    {icon}
  </button>
);

const CourseManage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [categories, setCategories] = useState<any[]>([]);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentCourseData, setCurrentCourseData] = useState<any>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedKeyword, filterCategory]);

  const fetchCategories = async () => {
    try {
      const cats = await GetCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (filterCategory && filterCategory !== "all") params.category = filterCategory;
      // Do not send status as requested
      
      const res = await searchCourses(params);
      const dataList = Array.isArray(res?.courses || res?.results || res) ? (res?.courses || res?.results || res) : [];
      setCourses(dataList);
      setTotal(res?.totalCourses || res?.total || dataList.length || 0);
    } catch (error) {
      console.error("Fetch courses error", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode("create");
    setCurrentCourseData(null);
    setModalVisible(true);
  };

  const handleEdit = async (courseId: string) => {
    try {
      setLoading(true);
      const data = await getCourseFullInfo(courseId);
      setCurrentCourseData(data);
      setModalMode("edit");
      setModalVisible(true);
    } catch (err) {
      message.error("Không thể lấy thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (courseId: string) => {
    try {
      setLoading(true);
      const data = await getCourseFullInfo(courseId);
      setCurrentCourseData(data);
      setModalMode("view");
      setModalVisible(true);
    } catch (err) {
      message.error("Không thể lấy thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (courseId: string) => {
    AntdModal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa khóa học này không? Hành động này có thể xóa các dữ liệu bài học bên trong.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteCourse(courseId);
          message.success("Xóa khóa học thành công");
          fetchCourses();
        } catch (err) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchCourses();
  };

  // Safe mapping helpers
  const getTeacherName = (course: Course) => course.instructor?.fullname || course.instructor?.name || "Chưa gán";
  const getTeacherAvatar = (course: Course) => course.instructor?.avatar || "https://i.pravatar.cc/40?img=1";
  const getCategoryName = (course: Course) => course.category?.category_name || course.category?.name || "Chưa phân loại";
  const getCourseName = (course: Course) => course.title || course.name || "Khóa học chưa có tên";
  const formatPrice = (price?: number | string) => {
    if (!price || price === "0" || price === 0) return "Miễn phí";
    return Number(price).toLocaleString() + "đ";
  };
  const getCourseStatus = (course: Course) => course.status || "active";
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return "Gần đây";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "Gần đây" : d.toLocaleDateString("vi-VN");
  };

  // Calculate dynamic stats based on current page logic or overall if available
  const activeCount = courses.filter(c => getCourseStatus(c) === "active").length;
  const freeCount = courses.filter(c => !c.price || c.price === "0" || c.price === 0).length;
  const paidCount = courses.length - freeCount;

  const stats = [
    {
      icon: <BookOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
      badge: "Hệ thống",
      label: "Tổng khóa học",
      value: total > 0 ? total : courses.length,
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
      badge: "Trang này",
      badgeColor: "#3a5a40",
      label: "Đang hoạt động",
      value: activeCount,
    },
    {
      icon: <VideoCameraOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
      badge: "Trang này",
      label: "Khóa học trả phí",
      value: paidCount,
    },
    {
      icon: <TeamOutlined style={{ fontSize: 22, color: "#3a5a40" }} />,
      badge: "Trang này",
      label: "Khóa học miễn phí",
      value: freeCount,
    },
  ];

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-3 shadow-sm">
      <img
        src={course.thumbnail || "https://i.pravatar.cc/100?img=1"}
        alt={getCourseName(course)}
        className="w-16 h-16 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
            {getCourseName(course)}
          </p>
          <StatusPill status={getCourseStatus(course)} />
        </div>
        <p className="text-xs text-gray-400 mb-1">Cập nhật {getFormattedDate(course.updatedAt)}</p>
        <div className="flex items-center gap-2 mb-2">
          <img
            src={getTeacherAvatar(course)}
            alt={getTeacherName(course)}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-xs text-gray-600">{getTeacherName(course)}</span>
          <CategoryPill label={getCategoryName(course)} />
        </div>
        <div className="flex items-center justify-between">
          <span
            className="font-bold text-sm"
            style={{ color: formatPrice(course.price) === "Miễn phí" ? "#16a34a" : "#3a5a40" }}
          >
            {formatPrice(course.price)}
          </span>
          <div className="flex gap-2">
            <ActionBtn title="Xem" icon={<EyeOutlined style={{ fontSize: 13 }} />} onClick={() => handleView(course._id)} />
            <ActionBtn title="Sửa" icon={<EditOutlined style={{ fontSize: 13 }} />} onClick={() => handleEdit(course._id)} />
            <ActionBtn title="Xóa" icon={<DeleteOutlined style={{ fontSize: 13 }} />} danger onClick={() => handleDelete(course._id)} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10 relative">
      <Spin spinning={loading} size="large" wrapperClassName="w-full">
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
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <div className="flex gap-2">
                <Select
                  value={filterCategory}
                  onChange={(val) => setFilterCategory(val)}
                  style={{ flex: 1, minWidth: 150, borderRadius: 8 }}
                >
                  <Option value="all">Tất cả thể loại</Option>
                  {categories.map((c) => (
                    <Option key={c._id} value={c._id}>{c.category_name || c.name}</Option>
                  ))}
                </Select>
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
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
                <CourseCard key={course._id} course={course} />
              ))}
              {courses.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-400">Không tìm thấy khóa học nào.</div>
              )}
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
                        key={course._id}
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
                            src={course.thumbnail || "https://i.pravatar.cc/100?img=1"}
                            alt={getCourseName(course)}
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
                            {getCourseName(course)}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              marginTop: 2,
                            }}
                          >
                            Cập nhật {getFormattedDate(course.updatedAt)}
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
                              src={getTeacherAvatar(course)}
                              alt={getTeacherName(course)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: 13, color: "#374151" }}>
                              {getTeacherName(course)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <CategoryPill label={getCategoryName(course)} />
                        </td>
                        <td className="p-4">
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: formatPrice(course.price) === "Miễn phí" ? "#16a34a" : "#3a5a40",
                            }}
                          >
                            {formatPrice(course.price)}
                          </span>
                        </td>
                        <td className="p-4">
                          <StatusPill status={getCourseStatus(course)} />
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
                              onClick={() => handleView(course._id)}
                            />
                            <ActionBtn
                              title="Sửa"
                              icon={<EditOutlined style={{ fontSize: 14 }} />}
                              onClick={() => handleEdit(course._id)}
                            />
                            <ActionBtn
                              title="Xóa"
                              icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                              danger
                              onClick={() => handleDelete(course._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">Không tìm thấy khóa học nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
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
                    HIỂN THỊ {courses.length} TRÊN {total} KHÓA HỌC
                  </span>
                  <Pagination 
                    current={page} 
                    pageSize={limit} 
                    total={total} 
                    onChange={(p) => setPage(p)} 
                    showSizeChanger={false}
                  />
                </div>
              )}
            </div>
          )}

          {/* Mobile pagination */}
          {isMobile && total > limit && (
            <div className="flex justify-center gap-2 pt-2 pb-4">
              <Pagination 
                size="small"
                current={page} 
                pageSize={limit} 
                total={total} 
                onChange={(p) => setPage(p)} 
              />
            </div>
          )}
        </div>
      </Spin>

      {/* Form Modal */}
      {modalVisible && (
        <CourseFormModal
          visible={modalVisible}
          mode={modalMode}
          initialData={currentCourseData}
          onCancel={() => setModalVisible(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default CourseManage;
