import React, { useEffect, useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";
import { Modal as AntdModal } from "antd";
import {
  GetCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  GetCoursesByCategory,
} from "../../api/admin/category";
import PermissionControl from "../../components/permissionControl";

type CategoryItem = {
  _id: string;
  category_name: string;
  description?: string;
  courseCount?: number;
};

type CategoryCourse = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  level?: string;
  status?: string;
};

type NotificationType = {
  type: "success" | "error";
  msg: string;
} | null;

type ModalType = "create" | "edit";

const CategoryManage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<NotificationType>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
  });
  const [previewCategoryId, setPreviewCategoryId] = useState<string>("");
  const [previewCategory, setPreviewCategory] = useState<string>("");
  const [previewCourses, setPreviewCourses] = useState<CategoryCourse[]>([]);

  const handlePreviewCourses = async (
    categoryId: string,
    categoryName: string,
  ) => {
    if (previewCategoryId === categoryId) {
      setPreviewCategoryId("");
      setPreviewCategory("");
      setPreviewCourses([]);
      return;
    }

    setPreviewCategoryId(categoryId);
    setPreviewCategory(categoryName);
    setIsPreviewLoading(true);
    try {
      const data = await GetCoursesByCategory(categoryId);
      setPreviewCourses(data.data || []);
    } catch (error: any) {
      setPreviewCourses([]);
      showNotification(
        "error",
        error?.response?.data?.message ||
          "Lỗi tải danh sách khóa học theo thể loại.",
      );
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      category_name: "",
      description: "",
    });
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setModalType("create");
    setEditingId(null);
    resetForm();
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await GetCategories();
      setCategories(data.results || []);
    } catch (error) {
      showNotification("error", "Lỗi tải danh sách thể loại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = () => {
    setModalType("create");
    setEditingId(null);
    resetForm();
    setIsOpenModal(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setModalType("edit");
    setEditingId(category._id);
    setFormData({
      category_name: category.category_name,
      description: category.description || "",
    });
    setIsOpenModal(true);
  };

  const handleDelete = async (
    id: string,
    title: string,
    quantityCourse: number,
  ) => {
    if (quantityCourse > 0) {
      AntdModal.warning({
        title: "Không thể xóa thể loại",
        content: `Thể loại "${title}" đang có khóa học thuộc thể loại này.`,
        okText: "Đã hiểu",
      });
      return;
    }

    AntdModal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa thể loại "${title}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await DeleteCategory(id);
          showNotification("success", "Xóa thể loại thành công!");
          await fetchCategories();
        } catch (error: any) {
          showNotification(
            "error",
            error?.response?.data?.message ||
              "Có lỗi xảy ra khi xóa thể loại.",
          );
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      showNotification("error", "Vui lòng nhập tên thể loại!");
      return;
    }

    try {
      setIsProcessing(true);

      const payload = {
        category_name: formData.category_name.trim(),
        description: formData.description.trim(),
      };

      if (modalType === "create") {
        await CreateCategory(payload);
        showNotification("success", "Thêm thể loại thành công!");
      }

      if (modalType === "edit" && editingId) {
        await UpdateCategory(editingId, payload);
        showNotification("success", "Cập nhật thể loại thành công!");
      }

      handleCloseModal();
      await fetchCategories();
    } catch (error: any) {
      showNotification(
        "error",
        error?.response?.data?.message ||
          (modalType === "create"
            ? "Có lỗi xảy ra khi thêm thể loại."
            : "Có lỗi xảy ra khi cập nhật thể loại."),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = [
    {
      label: "Tổng số thể loại",
      value: String(categories.length).padStart(2, "0"),
    },
    {
      label: "Thể loại hoạt động",
      value: String(categories.length).padStart(2, "0"),
    },
    {
      label: "Khóa học nhiều nhất",
      value:
        categories.length > 0
          ? categories.reduce((max, item) =>
              (item.courseCount || 0) > (max.courseCount || 0) ? item : max,
            ).category_name
          : "Chưa có",
    },
    {
      label: "Cập nhật cuối",
      value: "Vừa xong",
    },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-700">
              Quản lý thể loại
            </h1>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-gray-500">
              Tổ chức và phân loại các nội dung giáo dục của hệ thống CodeMaster
              AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {notification && (
              <span
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {notification.msg}
              </span>
            )}
            <PermissionControl permission="categories_create">
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Thêm thể loại mới
              </button>
            </PermissionControl>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
            >
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {stat.label}
              </p>
              <p className="truncate text-2xl font-extrabold text-brand-700">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="min-w-0 grid grid-cols-1 gap-5 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full rounded-2xl border border-brand-100 bg-white p-10 text-center text-gray-500 shadow-sm">
                Đang tải danh sách thể loại...
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-brand-100 bg-white p-10 text-center text-gray-500 shadow-sm">
                Chưa có thể loại nào.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() =>
                    handlePreviewCourses(category._id, category.category_name)
                  }
                  className={`group flex min-h-[220px] flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md ${
                    previewCategoryId === category._id
                      ? "border-brand-500 ring-2 ring-brand-500/10"
                      : "border-brand-100 hover:border-brand-200"
                  }`}
                >
                  <div className="relative z-10 flex flex-1 flex-col">
                    <div className="space-y-2">
                      <h3 className="break-words text-xl font-bold text-brand-700">
                        {category.category_name}
                      </h3>

                      <p className="line-clamp-3 text-sm leading-6 text-gray-600">
                        {category.description ||
                          "Chưa có mô tả cho thể loại này."}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-brand-100 bg-brand-50/60 px-3 py-1 text-xs font-semibold text-brand-700">
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[10px] font-bold leading-none text-white">
                          {(category.courseCount || 0).toString()}
                        </span>
                        <span className="truncate">Khóa học</span>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <PermissionControl permission="categories_edit">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-gray-50"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-5 w-5 text-brand-700" />
                          </button>
                        </PermissionControl>
                        <PermissionControl permission="categories_delete">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                category._id,
                                category.category_name,
                                Number(category.courseCount),
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[#ffdad6]"
                            title="Xóa"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </button>
                        </PermissionControl>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewCourses(
                              category._id,
                              category.category_name,
                            );
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            previewCategoryId === category._id
                              ? "bg-brand-600 text-white"
                              : "text-brand-700 hover:bg-brand-50"
                          }`}
                          title="Xem khóa học"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <PermissionControl permission="categories_create">
              <button
                onClick={handleAddCategory}
                className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-white p-8 text-center transition hover:border-brand-500"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-brand-700">
                  <Plus className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-brand-700">
                  Tạo thể loại mới
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Mở rộng danh mục đào tạo của bạn
                </p>
              </button>
            </PermissionControl>
          </div>

          <div className="min-w-0 xl:sticky xl:top-6">
            {previewCategoryId ? (
              <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words text-lg font-bold text-brand-700">
                      Khóa học: {previewCategory}
                    </h3>
                    <span className="shrink-0 rounded-full border border-brand-100 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                      {previewCourses.length}
                    </span>
                  </div>
                </div>

                <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
                  {isPreviewLoading ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                      Đang tải danh sách khóa học...
                    </div>
                  ) : previewCourses.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                      Chưa có khóa học nào thuộc thể loại này.
                    </div>
                  ) : (
                    previewCourses.map((course, i) => (
                      <div
                        key={course._id}
                        className="flex min-w-0 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-800">
                            {course.title}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-brand-700">
                              {Number(course.price || 0).toLocaleString("vi-VN")} Đ
                            </span>
                            <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-medium text-gray-600">
                              {course.level || course.status || "Khóa học"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-brand-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                Chọn một thể loại để xem danh sách khóa học ở bên phải.
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-brand-100">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === "create"
                    ? "Thêm thể loại mới"
                    : "Chỉnh sửa thể loại"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {modalType === "create"
                    ? "Nhập thông tin để tạo thể loại mới cho hệ thống."
                    : "Cập nhật thông tin thể loại trong hệ thống."}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tên thể loại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_name: e.target.value,
                    }))
                  }
                  placeholder="VD: Frontend Development"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Nhập mô tả ngắn cho thể loại..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="rounded-2xl px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Hủy bỏ
              </button>

              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing
                  ? modalType === "create"
                    ? "Đang thêm..."
                    : "Đang cập nhật..."
                  : modalType === "create"
                    ? "Thêm mới"
                    : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManage;
