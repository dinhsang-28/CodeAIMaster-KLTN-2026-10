import React, { useEffect, useState } from "react";
// import { useUserInfo } from "../../../store/user";
import PermissionControl from "../../../components/permissionControl";
import {
  GetRoles,
  CreateRole,
  UpdateRole,
  DeleteRole,
} from "../../../api/admin/role";

const RoleManage: React.FC = () => {
  // --- STATE DỮ LIỆU ---
  const [roles, setRoles] = useState<any[]>([]);

  // --- STATE PHÂN TRANG & TÌM KIẾM ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");

  // --- STATE UI ---
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
    roleId?: string;
  }>({ isOpen: false, type: "create" });
  const [formData, setFormData] = useState({ role_name: "", description: "" });

  const showNotification = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- FETCH DATA ---
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await GetRoles({
        current: currentPage,
        pageSize,
        search: activeSearch,
      });

      // Xử lý dữ liệu trả về theo format { results, meta }
      if (data && data.results) {
        setRoles(data.results);
        setTotalPages(data.meta?.pages || 1);
        setTotalItems(data.meta?.total || 0);
      } else {
        setRoles(data || []); // Đề phòng backend chưa update kịp
      }
    } catch {
      showNotification("error", "Lỗi tải danh sách Nhóm quyền.");
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi chuyển trang hoặc đổi từ khóa tìm kiếm
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeSearch]);

  // Xử lý Debounce tìm kiếm (chờ 0.5s sau khi gõ xong)
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setActiveSearch(searchInput.trim());
      setCurrentPage(1); // Gõ từ khóa mới thì về trang 1
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchInput]);

  // --- THÊM / SỬA / XÓA ---
  const handleSubmit = async () => {
    if (!formData.role_name.trim())
      return showNotification("error", "Vui lòng nhập tên nhóm quyền!");
    setIsProcessing(true);
    try {
      if (modalConfig.type === "create") {
        await CreateRole(formData);
        showNotification("success", "Tạo nhóm quyền thành công!");
        setCurrentPage(1); // Quay về trang 1 để xem dòng mới tạo
      } else {
        if (modalConfig.roleId) await UpdateRole(modalConfig.roleId, formData);
        showNotification("success", "Cập nhật thành công!");
      }
      setModalConfig({ isOpen: false, type: "create" });
      await fetchRoles();
    } catch (error: any) {
      showNotification(
        "error",
        error.response?.data?.message || "Lỗi hệ thống.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (
      roleName === "Admin" ||
      roleName === "Super Admin" ||
      roleName === "user"
    ) {
      return showNotification(
        "error",
        "Không được xóa nhóm quyền hệ thống mặc định!",
      );
    }
    if (!window.confirm(`Xóa nhóm quyền "${roleName}"?`)) return;

    try {
      await DeleteRole(roleId);
      showNotification("success", "Xóa thành công!");
      await fetchRoles();
    } catch {
      showNotification("error", "Lỗi khi xóa.");
    }
  };

  const openEdit = (role: any) => {
    setFormData({
      role_name: role.role_name,
      description: role.description || "",
    });
    setModalConfig({ isOpen: true, type: "edit", roleId: role._id });
  };

  const openCreate = () => {
    setFormData({ role_name: "", description: "" });
    setModalConfig({ isOpen: true, type: "create" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* --- HEADER & TÌM KIẾM --- */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Danh sách Nhóm Quyền
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý các vai trò (Roles) trong hệ thống.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Thanh Tìm Kiếm Động */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm tên nhóm quyền..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-[42px] pl-4 pr-10 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <PermissionControl permission="roles_create">
            <button
              onClick={openCreate}
              className="w-full sm:w-auto px-6 h-[42px] rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              + Tạo Nhóm Mới
            </button>
          </PermissionControl>
        </div>
      </div>

      {/* Thông báo */}
      {notification && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in-up ${notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {notification.msg}
        </div>
      )}

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Tên Nhóm Quyền
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 w-1/2">
                  Mô tả
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    Không tìm thấy nhóm quyền nào.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-brand-700">
                      {role.role_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-normal">
                      {role.description || "Không có mô tả"}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <PermissionControl permission="roles_edit">
                        <button
                          onClick={() => openEdit(role)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                          title="Sửa thông tin"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </PermissionControl>

                      <PermissionControl permission="roles_delete">
                        <button
                          onClick={() => handleDelete(role._id, role.role_name)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                          title="Xóa nhóm quyền"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </PermissionControl>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- CHÂN TRANG: PHÂN TRANG --- */}
        {!loading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 p-4 bg-gray-50/50">
            <span className="text-sm text-gray-500 mb-3 sm:mb-0">
              Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong> đến{" "}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong>{" "}
              trong tổng số <strong>{totalItems}</strong> nhóm quyền
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Trước
              </button>
              <span className="px-4 text-sm font-semibold text-brand-700">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold">
              {modalConfig.type === "create" ? "Tạo Nhóm Mới" : "Sửa Nhóm"}
            </h3>
            <input
              type="text"
              placeholder="Tên nhóm quyền"
              value={formData.role_name}
              onChange={(e) =>
                setFormData({ ...formData, role_name: e.target.value })
              }
              className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none"
            />
            <textarea
              placeholder="Mô tả..."
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full mb-6 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-400 transition"
              >
                {isProcessing ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManage;
