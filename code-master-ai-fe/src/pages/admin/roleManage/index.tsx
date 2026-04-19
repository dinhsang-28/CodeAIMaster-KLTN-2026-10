// import React, { useEffect, useState } from "react";
// import { useUserInfo } from "../../../store/user";
// import PermissionControl from "../../../components/permissionControl";
// import { GetRoles, CreateRole, UpdateRole, DeleteRole } from "../../../api/admin/role"; 

// const RoleManage: React.FC = () => {
//     const [roles, setRoles] = useState<any[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    
//     // Modal State
//     const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'create' | 'edit', roleId?: string }>({ isOpen: false, type: 'create' });
//     const [formData, setFormData] = useState({ role_name: "", description: "" });
//     const [isProcessing, setIsProcessing] = useState(false);

//     const userInfo = useUserInfo((state) => state.userInfo);
//     const hasPermission = userInfo?.permissions?.includes("roles_permissions");

//     const showNotification = (type: 'success' | 'error', msg: string) => {
//         setNotification({ type, msg });
//         setTimeout(() => setNotification(null), 3000);
//     };

//     const fetchRoles = async () => {
//         setLoading(true);
//         try {
//             const data = await GetRoles();
//             setRoles(data);
//         } catch {
//             showNotification("error", "Lỗi tải danh sách Nhóm quyền.");
//         } finally { setLoading(false); }
//     };

//     useEffect(() => { fetchRoles(); }, []);

//     const handleSubmit = async () => {
//         if (!formData.role_name.trim()) return showNotification("error", "Vui lòng nhập tên nhóm quyền!");
//         setIsProcessing(true);
//         try {
//             if (modalConfig.type === 'create') {
//                 await CreateRole(formData);
//                 showNotification("success", "Tạo nhóm quyền thành công!");
//             } else {
//                 if (modalConfig.roleId) await UpdateRole(modalConfig.roleId, formData);
//                 showNotification("success", "Cập nhật thành công!");
//             }
//             setModalConfig({ isOpen: false, type: 'create' });
//             await fetchRoles();
//         } catch (error: any) {
//             showNotification("error", error.response?.data?.message || "Lỗi hệ thống.");
//         } finally { setIsProcessing(false); }
//     };

//     const handleDelete = async (roleId: string, roleName: string) => {
//         if (roleName === "Admin" || roleName === "Super Admin") {
//             return showNotification("error", "Không được xóa nhóm quản trị cấp cao!");
//         }
//         if (!window.confirm(`Xóa nhóm quyền "${roleName}"?`)) return;
        
//         try {
//             await DeleteRole(roleId);
//             showNotification("success", "Xóa thành công!");
//             await fetchRoles();
//         } catch { showNotification("error", "Lỗi khi xóa."); }
//     };

//     const openEdit = (role: any) => {
//         setFormData({ role_name: role.role_name, description: role.description || "" });
//         setModalConfig({ isOpen: true, type: 'edit', roleId: role._id });
//     };

//     const openCreate = () => {
//         setFormData({ role_name: "", description: "" });
//         setModalConfig({ isOpen: true, type: 'create' });
//     };

//     return (
//         <div className="mx-auto max-w-7xl">
//             {/* Header */}
//             <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
//                 <div>
//                     <h2 className="text-2xl font-bold text-gray-900">Danh sách Nhóm Quyền</h2>
//                     <p className="text-sm text-gray-500">Quản lý các vai trò (Roles) trong hệ thống.</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     {notification && (
//                         <span className={`px-4 py-2 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{notification.msg}</span>
//                     )}
//                     <PermissionControl permission="roles_permissions">
//                         <button onClick={openCreate} className="px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm">
//                             + Tạo Nhóm Mới
//                         </button>
//                     </PermissionControl>
//                 </div>
//             </div>

//             {/* Bảng dữ liệu */}
//             <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
//                 <table className="min-w-full text-left text-sm whitespace-nowrap">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             <th className="px-6 py-4 font-semibold text-gray-900">Tên Nhóm Quyền</th>
//                             <th className="px-6 py-4 font-semibold text-gray-900 w-1/2">Mô tả</th>
//                             <th className="px-6 py-4 font-semibold text-gray-900 text-center">Thao tác</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                         {loading ? <tr><td colSpan={3} className="text-center py-8">Đang tải...</td></tr> : roles.map((role) => (
//                             <tr key={role._id} className="hover:bg-gray-50">
//                                 <td className="px-6 py-4 font-bold text-brand-700">{role.role_name}</td>
//                                 <td className="px-6 py-4 text-gray-500 whitespace-normal">{role.description || "Không có mô tả"}</td>
//                                 <td className="px-6 py-4 flex justify-center gap-3">
//                                     <PermissionControl permission="roles_permissions">
//                                         <button onClick={() => openEdit(role)} className="text-blue-500 hover:text-blue-700 font-medium">Sửa</button>
//                                         <button onClick={() => handleDelete(role._id, role.role_name)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
//                                     </PermissionControl>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Modal Thêm/Sửa */}
//             {modalConfig.isOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
//                     <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl">
//                         <h3 className="mb-4 text-xl font-bold">{modalConfig.type === 'create' ? "Tạo Nhóm Mới" : "Sửa Nhóm"}</h3>
//                         <input type="text" placeholder="Tên nhóm quyền" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none" />
//                         <textarea placeholder="Mô tả..." rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mb-6 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none"></textarea>
//                         <div className="flex justify-end gap-3">
//                             <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200">Hủy</button>
//                             <button onClick={handleSubmit} disabled={isProcessing} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-400">
//                                 {isProcessing ? "Đang lưu..." : "Xác nhận"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RoleManage;

import React, { useEffect, useState } from "react";
import PermissionControl from "../../../components/permissionControl";
import { GetRoles, CreateRole, UpdateRole, DeleteRole } from "../../../api/admin/role";

const RoleManage: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    
    // Modal State
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'create' | 'edit', roleId?: string }>({ isOpen: false, type: 'create' });
    const [formData, setFormData] = useState({ role_name: "", description: "" });
    const [isProcessing, setIsProcessing] = useState(false);

    const showNotification = (type: 'success' | 'error', msg: string) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await GetRoles();
            setRoles(data);
        } catch {
            showNotification("error", "Lỗi tải danh sách Nhóm quyền.");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const handleSubmit = async () => {
        if (!formData.role_name.trim()) return showNotification("error", "Vui lòng nhập tên nhóm quyền!");
        setIsProcessing(true);
        try {
            if (modalConfig.type === 'create') {
                await CreateRole(formData);
                showNotification("success", "Tạo nhóm quyền thành công!");
            } else {
                if (modalConfig.roleId) await UpdateRole(modalConfig.roleId, formData);
                showNotification("success", "Cập nhật thành công!");
            }
            setModalConfig({ isOpen: false, type: 'create' });
            await fetchRoles();
        } catch (error: any) {
            showNotification("error", error.response?.data?.message || "Lỗi hệ thống.");
        } finally { setIsProcessing(false); }
    };

    const handleDelete = async (roleId: string, roleName: string) => {
        if (roleName === "Admin" || roleName === "Super Admin") {
            return showNotification("error", "Không được xóa nhóm quản trị cấp cao!");
        }
        if (!window.confirm(`Xóa nhóm quyền "${roleName}"?`)) return;
        
        try {
            await DeleteRole(roleId);
            showNotification("success", "Xóa thành công!");
            await fetchRoles();
        } catch { showNotification("error", "Lỗi khi xóa."); }
    };

    const openEdit = (role: any) => {
        setFormData({ role_name: role.role_name, description: role.description || "" });
        setModalConfig({ isOpen: true, type: 'edit', roleId: role._id });
    };

    const openCreate = () => {
        setFormData({ role_name: "", description: "" });
        setModalConfig({ isOpen: true, type: 'create' });
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Danh sách Nhóm Quyền</h2>
                    <p className="text-sm text-gray-500">Quản lý các vai trò (Roles) trong hệ thống.</p>
                </div>
                <div className="flex items-center gap-4">
                    {notification && (
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{notification.msg}</span>
                    )}
                    
                    {/*  NÚT THÊM  KIỂM TRA QUYỀN roles_create */}
                    <PermissionControl permission="roles_create">
                        <button onClick={openCreate} className="px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm">
                            + Tạo Nhóm Mới
                        </button>
                    </PermissionControl>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Tên Nhóm Quyền</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 w-1/2">Mô tả</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan={3} className="text-center py-8">Đang tải...</td></tr> : roles.map((role) => (
                            <tr key={role._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-bold text-brand-700">{role.role_name}</td>
                                <td className="px-6 py-4 text-gray-500 whitespace-normal">{role.description || "Không có mô tả"}</td>
                                <td className="px-6 py-4 flex justify-center gap-3">
                                    
                                    {/*  NÚT SỬA -> KIỂM TRA QUYỀN roles_edit */}
                                    <PermissionControl permission="roles_edit">
                                        <button onClick={() => openEdit(role)} className="text-blue-500 hover:text-blue-700 font-medium">Sửa</button>
                                    </PermissionControl>

                                    {/* NÚT XÓA -> KIỂM TRA QUYỀN roles_delete */}
                                    <PermissionControl permission="roles_delete">
                                        <button onClick={() => handleDelete(role._id, role.role_name)} className="text-red-500 hover:text-red-700 font-medium">Xóa</button>
                                    </PermissionControl>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Thêm/Sửa */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl">
                        <h3 className="mb-4 text-xl font-bold">{modalConfig.type === 'create' ? "Tạo Nhóm Mới" : "Sửa Nhóm"}</h3>
                        <input type="text" placeholder="Tên nhóm quyền" value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none" />
                        <textarea placeholder="Mô tả..." rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full mb-6 px-4 py-3 rounded-xl border border-gray-300 focus:border-brand-500 outline-none"></textarea>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200">Hủy</button>
                            <button onClick={handleSubmit} disabled={isProcessing} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-400">
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