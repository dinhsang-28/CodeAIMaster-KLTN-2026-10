import { showMessage } from "../../utils/showMessages";
import { axiosInstance } from "../../utils/axios";
export const API_URL = "https://codeaimaster-kltn-2026-10.onrender.com/api/v1";
interface PostRegisterProps {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PostLoginProps {
  email: string;
  password: string;
  permissions?: string[];
}

interface LoginResponse {
  permissions: never[];
  access_token: string;
  user?: any;
}

export const PostRegister = async ({
  fullname,
  email,
  password,
}: PostRegisterProps) => {
  try {
    const res = await axiosInstance.post("/auth/register", {
      name: fullname,
      email,
      password,
    });
    console.log("THANH CONG: ", res.data);
    return res.data;
  } catch (err: any) {
    console.log("THAT BAI: ", err);
    throw err; // Ném lỗi về cho Form xử lý
  }
};

export const PostLogin = async ({
  email,
  password,
  permissions = [],
}: PostLoginProps): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>("/auth/login", {
      username: email,
      password,
      permissions, // Gửi thêm permissions nếu có (dành cho admin)
    });
    console.log("THANH CONG: ", res.data);
    return res.data;
  } catch (err: any) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};

export const PostOTP = async ({ _id, code }: { _id: string; code: string }) => {
  try {
    const res = await axiosInstance.post("/auth/check-code", { _id, code });
    console.log("THANH CONG: ", res.data);
    showMessage("success", "Xác thực thành công!");
    return res.data;
  } catch (err) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};

export const handleGoogleLogin = async () => {
  window.location.href = `${API_URL}/auth/google`;
};
export const handleGithubLogin = () => {
  window.location.href = `${API_URL}/auth/github`;
};
export const PostLogout = async () => {
  try {
    const res = await axiosInstance.post("/auth/logout");
    console.log("data logout", res.data);
    return res.data;
  } catch (error) {
    console.log("Loi dang xuat", error);
    return error;
  }
};
// gui yeu cau lay ma otp
export const PostRetryPassword = async (data: { email: string }) => {
  const res = await axiosInstance.post("/auth/retry-password", data);
  return res.data;
};
// kiem tra ma otp
export const PostVerifyForgotOTP = async (data: {
  email: string;
  code: string;
}) => {
  const res = await axiosInstance.post("/auth/verify-forgot-otp", data);
  return res.data;
};
// thay doi mat khau
export const PostChangePassword = async (data: any) => {
  const res = await axiosInstance.post("/auth/change-password", data);
  return res.data;
};
// lay lai userinfo
export const GetMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  console.log("GetMe response: ", response.data);
  return response.data;
}

// Moi  dang test (ae sua nho nhan sang hihi)
// con chatbot tu van
export const PostChatConsultant = async (data: { chatHistory: any[], newMessage: string }) => {
  const res = await axiosInstance.post('/submissions/chat-consultant', data);
  return res.data;
};

// Lấy danh sách khách hàng yêu cầu tư vấn (Dành cho Admin)
export const GetLeadsAdvisories = async (page: number = 1, limit: number = 10, status: string = 'ALL') => {
  const params: any = { page, limit };
  if (status !== 'ALL') {
    params.status = status; // Chỉ gửi status nếu khác ALL
  }
  const res = await axiosInstance.get('/submissions/leads/advisories', { params });
  return res.data;
};

// Cập nhật trạng thái khách hàng tiềm năng
export const UpdateLeadStatus = async (id: string, status: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
  const res = await axiosInstance.patch(`/submissions/leads/advisories/${id}/status`, { status });
  return res.data;
};
