import React, { useEffect, useState } from "react";
import { Table, Button, Checkbox, Select, message, Spin } from "antd";
import { useUserInfo } from "../../../store/user";
import PermissionControl from "../../../components/permissionControl";
import { GetRoles, UpdateRolePermissions } from "../../../api/admin/role"; // Giả sử bạn đã tạo file API này ở Bước 4 trước đó

const { Option } = Select;

// Định nghĩa các tính năng và hành động để vẽ bảng Ma trận
const permissionModules = [
    { label: "Quản lý Người Dùng", value: "users" },
    // { label: "Quản lý Nhóm Quyền", value: "roles" },
    { label: "Quản lý Khóa Học", value: "courses" },
    { label: "Quản lý Bài Tập", value: "exercises" },
    { label: "Quản lý Thể Loại", value: "categories" },
    { label: "Quản lý Bài Viết", value: "articles" },
    {label:"Quản lý nhóm quyền", value:"roles"},
    {label:"Quản lý phân quyền", value:"permissions"},
];

const actions = [
    { label: "Xem", value: "view" },
    { label: "Thêm", value: "create" },
    { label: "Sửa", value: "edit" },
    { label: "Xóa", value: "delete" },
];

// Quyền đặc biệt không nằm trong ma trận chuẩn
const specialPermissions = [
    { label: "Cấu hình Phân quyền (Super Admin)", value: "roles_permissions" },
    { label: "Quản lý Cài đặt hệ thống", value: "settings_view" },
];

const RoleManage: React.FC = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    // Lấy thông tin user hiện tại để check quyền
    const userInfo = useUserInfo((state) => state.userInfo);
    const hasPermissionToEdit = userInfo?.permissions?.includes("permissions_view"); // Giả sử "permissions_view" là quyền được phép chỉnh sửa phân quyền

    // Fetch danh sách Role từ Backend
    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await GetRoles();
            setRoles(data);
            if (data && data.length > 0) {
                // Mặc định chọn Role đầu tiên
                setSelectedRoleId(data[0]._id);
                setCurrentPermissions(data[0].permissions || []);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách Nhóm quyền");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Xử lý khi thay đổi Role đang chọn trong Dropdown
    const handleRoleChange = (roleId: string) => {
        setSelectedRoleId(roleId);
        const role = roles.find((r) => r._id === roleId);
        if (role) {
            setCurrentPermissions(role.permissions || []);
        }
    };

    // Xử lý khi Tích/Bỏ tích 1 ô quyền trong Ma trận
    const handleTogglePermission = (moduleValue: string, actionValue: string) => {
        if (!hasPermissionToEdit) return; // Không cho click nếu không có quyền
        
        const permissionCode = `${moduleValue}_${actionValue}`;
        setCurrentPermissions((prev) =>
            prev.includes(permissionCode)
                ? prev.filter((p) => p !== permissionCode)
                : [...prev, permissionCode]
        );
    };

    // Xử lý khi Tích/Bỏ tích Quyền Đặc biệt
    const handleToggleSpecialPermission = (permissionCode: string) => {
         if (!hasPermissionToEdit) return;

         setCurrentPermissions((prev) =>
            prev.includes(permissionCode)
                ? prev.filter((p) => p !== permissionCode)
                : [...prev, permissionCode]
        );
    }

    // Xử lý Lưu Quyền lên Backend
    const handleSavePermissions = async () => {
        if (!selectedRoleId) return;
        setSaving(true);
        try {
            await UpdateRolePermissions(selectedRoleId, currentPermissions);
            message.success("Cập nhật quyền thành công!");
            
            // Cập nhật lại state roles nội bộ để khỏi cần gọi lại API GET
            setRoles((prevRoles) => 
                prevRoles.map(role => 
                    role._id === selectedRoleId ? { ...role, permissions: currentPermissions } : role
                )
            );
        } catch (error) {
            message.error("Lỗi khi lưu quyền");
        } finally {
            setSaving(false);
        }
    };

    // Cấu hình Cột cho Bảng Ma trận (Ant Design Table)
    const columns = [
        {
            title: "Tính năng (Module)",
            dataIndex: "label",
            key: "label",
            width: "30%",
            render: (text: string) => <strong className="text-brand-700">{text}</strong>,
        },
        ...actions.map((action) => ({
            title: action.label,
            key: action.value,
            align: "center" as const,
            render: (_: any, record: any) => {
                const permissionCode = `${record.value}_${action.value}`;
                const isChecked = currentPermissions.includes(permissionCode);
                return (
                    <Checkbox
                        checked={isChecked}
                        onChange={() => handleTogglePermission(record.value, action.value)}
                        disabled={!hasPermissionToEdit} // Disable nếu không có quyền sửa
                    />
                );
            },
        })),
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-brand-900 mb-1">Cấu Hình Phân Quyền</h2>
                    <p className="text-sm text-brand-400">Thiết lập quyền hạn chi tiết cho từng nhóm tài khoản.</p>
                </div>
                
                <PermissionControl permission="permissions_view">
                    <Button 
                        type="primary" 
                        className="bg-brand-600 hover:bg-brand-700 h-10 px-6 rounded-xl"
                        onClick={handleSavePermissions}
                        loading={saving}
                    >
                        Lưu Thay Đổi
                    </Button>
                </PermissionControl>
            </div>

            <Spin spinning={loading}>
                <div className="mb-6 flex items-center gap-4">
                    <span className="font-semibold text-brand-700">Chọn Nhóm Quyền:</span>
                    <Select
                        className="w-64"
                        value={selectedRoleId}
                        onChange={handleRoleChange}
                        placeholder="Chọn một nhóm quyền"
                    >
                        {roles.map((role) => (
                            <Option key={role._id} value={role._id}>
                                {role.role_name}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* BẢNG MA TRẬN QUYỀN CHUẨN */}
                <h3 className="text-md font-bold text-brand-800 mb-3">Quyền Cơ Bản</h3>
                <Table
                    dataSource={permissionModules}
                    columns={columns}
                    pagination={false}
                    rowKey="value"
                    bordered
                    className="mb-8"
                    size="middle"
                />

                {/* DANH SÁCH QUYỀN ĐẶC BIỆT */}
                <h3 className="text-md font-bold text-brand-800 mb-3">Quyền Đặc Biệt</h3>
                <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {specialPermissions.map((special) => (
                        <Checkbox
                            key={special.value}
                            checked={currentPermissions.includes(special.value)}
                            onChange={() => handleToggleSpecialPermission(special.value)}
                            disabled={!hasPermissionToEdit}
                        >
                            {special.label}
                        </Checkbox>
                    ))}
                </div>
            </Spin>
        </div>
    );
};

export default RoleManage;