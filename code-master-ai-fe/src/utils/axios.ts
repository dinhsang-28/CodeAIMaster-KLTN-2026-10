// import axios from "axios";
// import { useUserInfo } from "../store/user";

// // export const axiosInstance = axios.create({
// //   baseURL: "https://codeaimaster-kltn-2026-10.onrender.com/api/v1",
// //   withCredentials: true,
// // });
// export const axiosInstance = axios.create({
//   baseURL: "http://localhost:3001/api/v1",
//   withCredentials: true,
// });
// // export const axiosInstance = axios.create({
// //   baseURL: "https://urchin-app-sfff5.ondigitalocean.app/api/v1",
// //   withCredentials: true,
// // });

// // ✅ Biến để tránh race condition: nhiều request 401 cùng lúc chỉ refresh 1 lần
// let isRefreshing = false;
// let failedQueue: any[] = [];

// const processQueue = (error: any) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(null);
//     }
//   });
//   failedQueue = [];
// };


// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response; // api thanh cong cho qua
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     //Bỏ qua các route auth — không refresh cho những URL này
//     const skipRefreshUrls = ["/auth/refresh", "/auth/login", "/auth/logout"];
//     const isSkipped = skipRefreshUrls.some((url) =>
//       originalRequest.url?.includes(url),
//     );
//     // bat loi het han access token
//     if (
//       error.response?.status === 401 &&
//       // !originalRequest._retry &&
//       !isSkipped
//     ) {
//       // originalRequest._retry = true;
//        // ✅ Nếu đang có request refresh rồi, đưa vào queue chờ
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then(() => axiosInstance(originalRequest))
//           .catch((err) => Promise.reject(err));
//       }
//        if (originalRequest._retry) {
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;
//       try {
//         await axiosInstance.post("/auth/refresh");
//          processQueue(null);
//         return axiosInstance(originalRequest);
//       } catch (error) {
//         // useUserInfo.getState().clearUserInfo();
//         // const currentPath = window.location.pathname;
//         // const publicPaths = ["/", "/introduce", "/blog", "/course"];
//         // const isPublicPage = publicPaths.some(path => 
//         //   path === "/" ? currentPath === "/" : currentPath.startsWith(path)
//         // );
//         // // if (window.location.pathname !== "/login") {
//         // //   window.location.href = "/login";
//         // // }
//         // if (!isPublicPage && currentPath !== "/login") {
//         //   window.location.href = "/login";
//         // }
//         // return Promise.reject(error);
//         processQueue(error);
//         useUserInfo.getState().clearUserInfo();

//         // ✅ Fix: chỉ redirect login nếu KHÔNG phải public page
//         const currentPath = window.location.pathname;
//         const publicPaths = ["/", "/introduce", "/blog", "/course"];
//         const isPublicPage = publicPaths.some((path) =>
//           path === "/" ? currentPath === "/" : currentPath.startsWith(path)
//         );

//         if (!isPublicPage && currentPath !== "/login") {
//           window.location.href = "/login";
//         }

//         return Promise.reject(error);
//       } finally {
//         isRefreshing = false;
//       }
//     }
//     return Promise.reject(error);
//   },
// );
// export default axiosInstance;
// axios.ts — đơn giản lại, bỏ hết logic thừa
// axios.ts
import axios from "axios";
import { useUserInfo } from "../store/user";

// export const axiosInstance = axios.create({
//   baseURL: "http://localhost:3001/api/v1",
//   withCredentials: true,
// });
// // export const axiosInstance = axios.create({
// //   baseURL: "https://codeaimaster-kltn-2026-10.onrender.com/api/v1",
// //   withCredentials: true,
// // });

export const axiosInstance = axios.create({
  baseURL: "https://urchin-app-sfff5.ondigitalocean.app/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const skipRefreshUrls = ["/auth/refresh", "/auth/login", "/auth/logout"];
    const isSkipped = skipRefreshUrls.some((url) =>
      originalRequest.url?.includes(url)
    );

    // skip nếu request được đánh dấu silent
    if (originalRequest._silent) {
      return Promise.reject(error);
    }
    //  const isSilent = originalRequest._silent;

    if (error.response?.status === 401 && !isSkipped) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useUserInfo.getState().clearUserInfo();

        const currentPath = window.location.pathname;
        const publicPaths = ["/", "/introduce", "/blog", "/course"];
        const isPublicPage = publicPaths.some((path) =>
          path === "/" ? currentPath === "/" : currentPath.startsWith(path)
        );

        if (!isPublicPage && currentPath !== "/login" ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
