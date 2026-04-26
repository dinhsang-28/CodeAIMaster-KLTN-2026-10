import axios from "axios";
import { useUserInfo } from "../store/user";

// export const axiosInstance = axios.create({
//   baseURL: "https://codeaimaster-kltn-2026-10.onrender.com/api/v1",
//   withCredentials: true,
// });
// export const axiosInstance = axios.create({
//   baseURL: "http://localhost:3001/api/v1",
//   withCredentials: true,
// });
export const axiosInstance = axios.create({
  baseURL: "https://urchin-app-sfff5.ondigitalocean.app/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response; // api thanh cong cho qua
  },
  async (error) => {
    const originalRequest = error.config;
    //Bỏ qua các route auth — không refresh cho những URL này
    const skipRefreshUrls = [
      "/auth/refresh",
      "/auth/login",
      "/auth/logout",
      "/",
    ];
    const isSkipped = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url),
    );
    // bat loi het han access token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isSkipped
    ) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/auth/refresh");
        return axiosInstance(originalRequest);
      } catch (error) {
        useUserInfo.getState().clearUserInfo();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
export default axiosInstance;
