// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { showMessage } from "../../utils/showMessages";
// import { useUserInfo } from "../../store/user";

// export default function GoogleAuthCallback() {
//   const navigate = useNavigate();
//   const { setUserInfo } = useUserInfo();

//   useEffect(() => {
//     try {
//       const params = new URLSearchParams(window.location.search);
//       const accessToken = params.get("access_token");
//       const userString = params.get("user");

//       if (!accessToken || !userString) {
//         showMessage("error", "Đăng nhập Google thất bại!");
//         navigate("/login");
//         return;
//       }

//       const user = JSON.parse(decodeURIComponent(userString));

//       localStorage.setItem("token", accessToken);
//       localStorage.setItem("user", JSON.stringify(user));
//       setUserInfo(user);

//       showMessage("success", "Đăng nhập Google thành công!");
//       navigate("/");
//     } catch (error) {
//       console.error("Google callback error:", error);
//       showMessage("error", "Có lỗi khi xử lý đăng nhập Google!");
//       navigate("/login");
//     }
//   }, [navigate, setUserInfo]);

//   return <div>Đang xử lý đăng nhập Google...</div>;
// }
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../../store/user";
export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { setUserInfo } = useUserInfo();
  //   if (ran.current) return;
  //   ran.current = true;
  //   try {
  //     const params = new URLSearchParams(window.location.search);
  //     const userString = params.get("user");

  //     if (!userString) {
  //       showMessage("error", "Đăng nhập Google thất bại!");
  //       navigate("/login");
  //       return;
  //     }

  //     const user = JSON.parse(decodeURIComponent(userString));
  //     console.log("User info from Google callback:", user);
  //     if (user.accessToken && user.refreshToken) {
  //       // Lưu Access Token (Sống 15 phút - 900 giây)
  //       document.cookie = `access_token=${user.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
  //       // Lưu Refresh Token (Sống 7 ngày - 604800 giây)
  //       document.cookie = `refresh_token=${user.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
  //     }
  //     const { accessToken, refreshToken, ...userInfoClean } = user;
      
  //     setUserInfo(userInfoClean); // ✅ gọi trực tiếp, không dùng useRef

  //     showMessage("success", "Đăng nhập Google thành công!");
  //     navigate("/", { replace: true });

  //     // Dọn dẹp token khỏi object trước khi lưu vào Zustand để bảo mật
  //     // delete user.accessToken;
  //     // delete user.refreshToken;
  //     // setUserInfo(user);
      
  //     // showMessage("success", "Đăng nhập Google thành công!");
  //     // navigate("/");
  //   } catch (error) {
  //     console.error("Google callback error:", error);
  //     showMessage("error", "Có lỗi khi xử lý đăng nhập Google!");
  //     navigate("/login");
  //   }
  // }, [navigate, setUserInfo]);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const userString = params.get("user");
  
  console.log("1. userString:", userString); // có data không?
  if (!userString) {
    navigate("/login");
    return;
  }
  try {
    const user = JSON.parse(decodeURIComponent(userString));
    console.log("2. user parsed:", user); // có đủ fields không?

    const { accessToken, refreshToken, ...userInfoClean } = user;
    console.log("3. userInfoClean:", userInfoClean); // object có rỗng không?

    if (accessToken) {
      document.cookie = `access_token=${accessToken}; path=/; max-age=900;SameSite=None; Secure`;
    }
    if (refreshToken) {
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800;SameSite=None; Secure`;
    }

    setUserInfo(userInfoClean);
    
    // Kiểm tra ngay sau khi set
    console.log("4. store sau khi set:", useUserInfo.getState().userInfo);

   setTimeout(() => {
  console.log("sau 100ms:", useUserInfo.getState().userInfo);
  // Kiểm tra localStorage trực tiếp
  console.log("localStorage:", localStorage.getItem("userInfo"));
  navigate("/", { replace: true });
}, 100);
  } catch (error) {
    console.error("Error:", error);
    navigate("/login");
  }
}, [navigate, setUserInfo]);
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
    </div>
  );
}