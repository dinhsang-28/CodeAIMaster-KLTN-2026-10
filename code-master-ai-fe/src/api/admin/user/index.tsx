import axiosInstance from "../../../utils/axios"; 

export const GetUsers = async (p0: { current: number; pageSize: number; search: string; }) => {
    const response = await axiosInstance.get('/users');
    console.log("GetUsers response:", response.data); 
    return response.data;
};

export const CreateUser = async (data: any) => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
};

export const UpdateUser = async (userId: string, data: any) => {
    const response = await axiosInstance.patch(`/users/${userId}`, data);
    return response.data;
};

export const DeleteUser = async (userId: string) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
};
export const UpdateMyProfile = async (data: any) => {
    // Lưu ý: data ở đây có thể là FormData nếu bạn có gửi file ảnh
    const response = await axiosInstance.patch('/users/profile/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
// Lấy danh sách Học viên 
export const GetStudentsList = async (current: number = 1, pageSize: number = 10, search: string = '') => {
  const params: any = { current, pageSize };
  if (search) {
    params.search = search; 
  }
  const res = await axiosInstance.get('/users/students', { params });
  return res.data; 
};
// khoa hoc vieen
export const ToggleStudentStatus = async (userId: string, status: 'active' | 'banned') => {
  const res = await axiosInstance.patch(`/users/students/${userId}/status`, { status });
  return res.data;
};