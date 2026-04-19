import axiosInstance from "../../../utils/axios";

export const GetRoles = async (params?: {
  current?: number;
  pageSize?: number;
  search?: string;
}) => {
  const response = await axiosInstance.get("/admin/roles", { params });
  return response.data;
};
export const GetRolesList = async () => {
  const response = await axiosInstance.get("/admin/roles/list");
  console.log("API GetRolesList response:", response);
  return response.data;
};

export const UpdateRolePermissions = async (
  roleId: string,
  permissions: string[],
) => {
  const response = await axiosInstance.patch(
    "/admin/roles/permissions/bulk-update",
    {
      roles: [{ id: roleId, permissions }],
    },
  );
  return response.data;
};

export const CreateRole = async (data: {
  role_name: string;
  description?: string;
}) => {
  const response = await axiosInstance.post("/admin/roles", data);
  return response.data;
};
export const UpdateRole = async (
  roleId: string,
  data: { role_name?: string; description?: string },
) => {
  const response = await axiosInstance.patch(`/admin/roles/${roleId}`, data);
  return response.data;
};
export const DeleteRole = async (roleId: string) => {
  const response = await axiosInstance.delete(`/admin/roles/${roleId}`);
  return response.data;
};
