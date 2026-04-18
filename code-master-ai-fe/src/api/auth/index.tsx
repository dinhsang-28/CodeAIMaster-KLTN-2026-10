import { showMessage } from "../../utils/showMessages";
import {axiosInstance} from "../../utils/axios"; 
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
    const res = await axiosInstance.post('/auth/register', {
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
    const res = await axiosInstance.post<LoginResponse>('/auth/login', {
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
    const res = await axiosInstance.post('/auth/check-code', { _id, code });
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
export const handleGithubLogin =  () => {
  window.location.href = `${API_URL}/auth/github`;
};
export const PostLogout = async ()=>{
  try {
    const res = await axiosInstance.post('/auth/logout');
    console.log("data logout",res.data);
    return res.data;
  } catch (error) {
    console.log("Loi dang xuat",error);
    return error;
  }
}
// export const GetMe = async ()=>{
//    const res = await axiosInstance.get('/auth/me');
//   return res.data;
// }