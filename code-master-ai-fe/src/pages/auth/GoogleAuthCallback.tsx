// // import { useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { showMessage } from "../../utils/showMessages";
// // import { useUserInfo } from "../../store/user";

// // export default function GoogleAuthCallback() {
// //   const navigate = useNavigate();
// //   const { setUserInfo } = useUserInfo();

// //   useEffect(() => {
// //     try {
// //       const params = new URLSearchParams(window.location.search);
// //       const accessToken = params.get("access_token");
// //       const userString = params.get("user");

// //       if (!accessToken || !userString) {
// //         showMessage("error", "Đăng nhập Google thất bại!");
// //         navigate("/login");
// //         return;
// //       }

// //       const user = JSON.parse(decodeURIComponent(userString));

// //       localStorage.setItem("token", accessToken);
// //       localStorage.setItem("user", JSON.stringify(user));
// //       setUserInfo(user);

// //       showMessage("success", "Đăng nhập Google thành công!");
// //       navigate("/");
// //     } catch (error) {
// //       console.error("Google callback error:", error);
// //       showMessage("error", "Có lỗi khi xử lý đăng nhập Google!");
// //       navigate("/login");
// //     }
// //   }, [navigate, setUserInfo]);

// //   return <div>Đang xử lý đăng nhập Google...</div>;
// // }

// // import { useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useUserInfo } from "../../store/user";
// // export default function GoogleAuthCallback() {
// //   const navigate = useNavigate();
// //   const { setUserInfo } = useUserInfo();
// //   //   if (ran.current) return;
// //   //   ran.current = true;
// //   //   try {
// //   //     const params = new URLSearchParams(window.location.search);
// //   //     const userString = params.get("user");

// //   //     if (!userString) {
// //   //       showMessage("error", "Đăng nhập Google thất bại!");
// //   //       navigate("/login");
// //   //       return;
// //   //     }

// //   //     const user = JSON.parse(decodeURIComponent(userString));
// //   //     console.log("User info from Google callback:", user);
// //   //     if (user.accessToken && user.refreshToken) {
// //   //       // Lưu Access Token (Sống 15 phút - 900 giây)
// //   //       document.cookie = `access_token=${user.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
// //   //       // Lưu Refresh Token (Sống 7 ngày - 604800 giây)
// //   //       document.cookie = `refresh_token=${user.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
// //   //     }
// //   //     const { accessToken, refreshToken, ...userInfoClean } = user;
      
// //   //     setUserInfo(userInfoClean); // ✅ gọi trực tiếp, không dùng useRef

// //   //     showMessage("success", "Đăng nhập Google thành công!");
// //   //     navigate("/", { replace: true });

// //   //     // Dọn dẹp token khỏi object trước khi lưu vào Zustand để bảo mật
// //   //     // delete user.accessToken;
// //   //     // delete user.refreshToken;
// //   //     // setUserInfo(user);
      
// //   //     // showMessage("success", "Đăng nhập Google thành công!");
// //   //     // navigate("/");
// //   //   } catch (error) {
// //   //     console.error("Google callback error:", error);
// //   //     showMessage("error", "Có lỗi khi xử lý đăng nhập Google!");
// //   //     navigate("/login");
// //   //   }
// //   // }, [navigate, setUserInfo]);
// //   useEffect(() => {
// //   const params = new URLSearchParams(window.location.search);
// //   const userString = params.get("user");
  
// //   console.log("1. userString:", userString); // có data không?
// //   if (!userString) {
// //     navigate("/login");
// //     return;
// //   }
// //   try {
// //     const user = JSON.parse(decodeURIComponent(userString));
// //     console.log("2. user parsed:", user); // có đủ fields không?

// //     const { accessToken, refreshToken, ...userInfoClean } = user;
// //     console.log("3. userInfoClean:", userInfoClean); // object có rỗng không?

// //     if (accessToken) {
// //       document.cookie = `access_token=${accessToken}; path=/; max-age=900;SameSite=None; Secure`;
// //     }
// //     if (refreshToken) {
// //       document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800;SameSite=None; Secure`;
// //     }

// //     // setUserInfo(userInfoClean);
    
// //     // Kiểm tra ngay sau khi set
// //     console.log("4. store sau khi set:", useUserInfo.getState().userInfo);

// //     localStorage.setItem("userInfo", JSON.stringify({
// //       state: { userInfo: userInfoClean },
// //       version: 0
// //     }));
// //     window.location.href = "/";

// //   //  setTimeout(() => {
// // //   console.log("sau 100ms:", useUserInfo.getState().userInfo);
// // //   // Kiểm tra localStorage trực tiếp
// // //   console.log("localStorage:", localStorage.getItem("userInfo"));
// // //   navigate("/", { replace: true });
// // // }, 100);
// //   } catch (error) {
// //     console.error("Error:", error);
// //     navigate("/login");
// //   }
// // }, [navigate, setUserInfo]);
// //   return (
// //     <div className="flex h-screen items-center justify-center">
// //       <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
// //     </div>
// //   );
// // }

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { showMessage } from "../../utils/showMessages";
// import { useUserInfo } from "../../store/user";
// import axiosInstance from "../../utils/axios";

// export default function GoogleAuthCallback() {
//   const navigate = useNavigate();
//   const { setUserInfo } = useUserInfo();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const userString = params.get("user");

//     if (!userString) {
//       showMessage("error", "Đăng nhập Google thất bại!");
//       navigate("/login");
//       return;
//     }

//     const init = async () => {
//       try {
//         const user = JSON.parse(decodeURIComponent(userString));
//         const { accessToken, refreshToken, ...userInfoClean } = user;

//         // ✅ Gọi API để backend set httpOnly cookie đúng cách
//         await axiosInstance.post("/auth/oauth/set-cookie", { accessToken, refreshToken });

//         // ✅ Lưu userInfo vào Zustand
//         setUserInfo(userInfoClean);

//         showMessage("success", "Đăng nhập Google thành công!");
//         window.location.href = "/";
//       } catch (error) {
//         showMessage("error", "Đăng nhập Google thất bại!");
//         navigate("/login");
//       }
//     };

//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="flex h-screen items-center justify-center">
//       <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserInfo } from "../../store/user";
import axiosInstance from "../../utils/axios";
import AuthLayout from "../../layout/authLayout";
import { CloseCircleFilled, LoadingOutlined, ArrowLeftOutlined } from "@ant-design/icons";

export default function GoogleAuthCallback() {
  const { setUserInfo } = useUserInfo();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const errorFromServer = params.get("error");
    if (errorFromServer) {
      setErrorMessage(decodeURIComponent(errorFromServer));
      return;
    }

    const userString = params.get("user");
    if (!userString) {
      setErrorMessage("Không tìm thấy thông tin đăng nhập từ Google.");
      return;
    }

    const init = async () => {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        const { accessToken, refreshToken, ...userInfoClean } = user;

        await axiosInstance.post("/auth/oauth/set-cookie", { accessToken, refreshToken });

        setUserInfo(userInfoClean);

        window.location.href = "/";
      } catch (error: any) {
        setErrorMessage("Có lỗi xảy ra trong quá trình xác thực với Google. Vui lòng thử lại.");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMessage) {
    return (
        <div className="w-full max-w-md p-8 text-center">
          <CloseCircleFilled className="text-6xl text-red-500 mb-6" />

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Đăng nhập thất bại
          </h2>

          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 text-sm font-medium">
            {errorMessage}
          </div>

          <p className="text-gray-600 mb-8">
            Vui lòng sử dụng phương thức đăng nhập bạn đã dùng để đăng ký tài khoản này ban đầu.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md shadow-brand-200"
          >
            <ArrowLeftOutlined />
            Quay lại trang đăng nhập
          </Link>
        </div>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <LoadingOutlined className="text-5xl text-brand-600 animate-spin mb-4" />
        <p className="text-brand-600 font-medium text-lg">Đang xử lý đăng nhập Google...</p>
        <p className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát.</p>
      </div>
    </AuthLayout>
  );
}