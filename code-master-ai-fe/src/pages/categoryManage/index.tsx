import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowRight, X } from "lucide-react";
import {
  GetCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} from "../../api/admin/category";

type CategoryItem = {
  _id: string;
  category_name: string;
  description?: string;
  courseCount?: number;
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

  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
  });

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

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa thể loại "${title}" không?`,
    );

    if (!confirmed) return;

    try {
      await DeleteCategory(id);
      showNotification("success", "Xóa thể loại thành công!");
      await fetchCategories();
    } catch (error: any) {
      showNotification(
        "error",
        error?.response?.data?.message || "Có lỗi xảy ra khi xóa thể loại.",
      );
    }
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
    <div className="min-h-screen bg-white px-8 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#062015]">
              Quản lý thể loại
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-[#424842]">
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

            <button
              onClick={handleAddCategory}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#23422a] to-[#3a5a40] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Thêm thể loại mới
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-[24px] bg-white p-10 text-center text-gray-500 shadow">
              Đang tải danh sách thể loại...
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full rounded-[24px] bg-white p-10 text-center text-gray-500 shadow">
              Chưa có thể loại nào.
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="group relative overflow-hidden rounded-[24px] border border-transparent bg-white p-8 shadow-[0px_10px_30px_rgba(6,32,21,0.03)] transition-all duration-300 hover:border-[#c7ecca] hover:shadow-xl"
              >
                <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#23422a]/5 transition-transform group-hover:scale-110" />

                <div className="relative z-10">
                  <h3 className="mb-2 text-2xl font-bold text-[#062015]">
                    {category.category_name}
                  </h3>

                  <p className="text-sm font-medium text-[#424842]">
                    {category.description || "Chưa có mô tả cho thể loại này."}
                  </p>

                  <div className="mt-8 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#ddfbe9] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#23422a]">
                      {(category.courseCount || 0).toString()} Khóa học
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded-lg p-2 transition hover:bg-[#beecb9]"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-5 w-5 text-[#23422a]" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(category._id, category.category_name)
                        }
                        className="rounded-lg p-2 transition hover:bg-[#ffdad6]"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>

                      <ArrowRight className="h-5 w-5 text-[#23422a]/40 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            onClick={handleAddCategory}
            className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c2c8bf] p-8 text-center transition hover:border-[#23422a]/50"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ddfbe9] text-[#23422a]">
              <Plus className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-[#062015]">
              Tạo thể loại mới
            </h3>
            <p className="mt-2 text-sm text-[#424842]">
              Mở rộng danh mục đào tạo của bạn
            </p>
          </button>
        </div>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
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
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#23422a] focus:ring-2 focus:ring-[#23422a]/10"
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
                  className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#23422a] focus:ring-2 focus:ring-[#23422a]/10"
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
                className="rounded-2xl bg-[#23422a] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b3521] disabled:cursor-not-allowed disabled:opacity-70"
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
