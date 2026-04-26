import React, { useEffect, useState } from "react";
import PermissionControl from "../../../components/permissionControl";
import {
  GetUsers,
  CreateUser,
  UpdateUser,
  DeleteUser,
} from "../../../api/admin/user";
import { GetRolesList } from "../../../api/admin/role";

const UserManage: React.FC = () => {
  // --- STATE DỮ LIỆU ---
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // --- STATE PHÂN TRANG & TÌM KIẾM ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // --- STATE MODAL ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "create" | "edit";
    userId?: string;
  }>({ isOpen: false, type: "create" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const showNotification = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- FETCH DATA (Có truyền params) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        GetUsers({
          current: currentPage,
          pageSize: pageSize,
          search: activeSearch,
        }),
        GetRolesList(),
      ]);

      setUsers(usersData.results || []);
      setRoles(rolesData || []);

      // Cập nhật thông tin phân trang từ API trả về
      if (usersData.meta) {
        setTotalPages(usersData.meta.pages);
        setTotalItems(usersData.meta.total);
      }
    } catch (error) {
      showNotification("error", "Lỗi tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeSearch]);

  // xu ly tim kiem nhan
  useEffect(() => {
    // Cài đặt bộ đếm thời gian: Đợi 500ms sau khi người dùng ngừng gõ
    const delaySearch = setTimeout(() => {
      setActiveSearch(searchInput.trim());
      setCurrentPage(1); // Đưa về trang 1 mỗi khi có từ khóa mới
    }, 500); // 500ms = 0.5 giây

    // Dọn dẹp: Nếu người dùng gõ tiếp ký tự mới trước khi hết 500ms thì hủy lệnh cũ
    return () => clearTimeout(delaySearch);
  }, [searchInput]);

  //  THÊM / SỬA / XÓA
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role_id: roles.length > 0 ? roles[0]._id : "",
    });
    setModalConfig({ isOpen: true, type: "create" });
  };

  const handleOpenEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role_id: user.role_id?._id || user.role_id || "",
    });
    setModalConfig({ isOpen: true, type: "edit", userId: user._id });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.role_id) {
      return showNotification(
        "error",
        "Vui lòng nhập đầy đủ thông tin bắt buộc!",
      );
    }
    if (modalConfig.type === "create" && !formData.password) {
      return showNotification(
        "error",
        "Vui lòng đặt mật khẩu cho người dùng mới!",
      );
    }

    setIsProcessing(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role_id: formData.role_id,
      };
      if (formData.password) payload.password = formData.password;

      if (modalConfig.type === "create") {
        await CreateUser(payload);
        showNotification("success", "Tạo tài khoản thành công!");
        setCurrentPage(1); // Quay về trang 1 để thấy user mới
      } else if (modalConfig.userId) {
        await UpdateUser(modalConfig.userId, payload);
        showNotification("success", "Cập nhật thông tin thành công!");
      }

      setModalConfig({ ...modalConfig, isOpen: false });
      await fetchData();
    } catch (error: any) {
      showNotification(
        "error",
        error.response?.data?.message || "Lỗi khi xử lý.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}"?`))
      return;
    try {
      await DeleteUser(userId);
      showNotification("success", "Xóa tài khoản thành công!");
      await fetchData();
    } catch (error: any) {
      showNotification(
        "error",
        error.response?.data?.message || "Lỗi khi xóa tài khoản.",
      );
    }
  };

  const getRoleTagColor = (roleName: string) => {
    if (!roleName) return "bg-gray-100 text-gray-600 border-gray-200";
    if (roleName.includes("Admin"))
      return "bg-red-50 text-red-600 border-red-200";
    if (roleName.includes("Giảng viên") || roleName.includes("Teacher"))
      return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-green-50 text-green-600 border-green-200";
  };

  // 🚨 BỘ LỌC CHÍNH Ở ĐÂY: Chỉ giữ lại những tài khoản KHÔNG PHẢI là "user"
  const displayUsers = users.filter((u) => u.role_id?.role_name !== "user");

  return (
    <div className="mx-auto max-w-7xl">
      {/* --- HEADER & TÌM KIẾM --- */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Quản Lý Tài Khoản
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý nhân sự, giảng viên và quản trị viên trên hệ thống.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Thanh Tìm Kiếm */}
          {/* <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Tìm tên, email..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full h-[42px] pl-4 pr-10 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm"
                        />
                        <button 
                            onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    </div> */}
          {/* tim kiem nhanh */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm tên, email..."
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

          <PermissionControl permission="users_create">
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-6 h-[42px] rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              + Thêm Mới
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

      {/* --- TABLE DANH SÁCH --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Họ và Tên
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-900">
                  Vai trò (Role)
                </th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : displayUsers.length === 0 /* 🚨 Sử dụng displayUsers */ ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Không tìm thấy tài khoản nhân sự nào.
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => {
                  /* 🚨 Sử dụng displayUsers */
                  const roleName = user.role_id?.role_name || "Chưa cấp quyền";
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleTagColor(roleName)}`}
                        >
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        <PermissionControl permission="users_edit">
                          <button
                            onClick={() => handleOpenEdit(user)}
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

                        <PermissionControl permission="users_delete">
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                            title="Xóa tài khoản"
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
                  );
                })
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
              trong tổng số <strong>{totalItems}</strong> tài khoản
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

      {/* --- MODAL THÊM / SỬA --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 text-xl font-bold text-gray-900">
              {modalConfig.type === "create"
                ? "Tạo Tài Khoản Mới"
                : "Sửa Thông Tin"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Điền thông tin định danh và phân quyền cho tài khoản.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email đăng nhập <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={modalConfig.type === "edit"}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="admin@domain.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mật khẩu{" "}
                  {modalConfig.type === "create" ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-xs text-gray-400 font-normal">
                      (Bỏ trống nếu không đổi)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="********"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phân Quyền (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                >
                  <option value="" disabled>
                    -- Chọn nhóm quyền --
                  </option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex min-w-[100px] items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:bg-brand-400"
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManage;
