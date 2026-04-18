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
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../../utils/showMessages";
import { useUserInfo } from "../../store/user";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { setUserInfo } = useUserInfo();
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const userString = params.get("user");

      if (!userString) {
        showMessage("error", "Đăng nhập Google thất bại!");
        navigate("/login");
        return;
      }

      const user = JSON.parse(decodeURIComponent(userString));
      setUserInfo(user);
      showMessage("success", "Đăng nhập Google thành công!");
      navigate("/");
    } catch (error) {
      console.error("Google callback error:", error);
      showMessage("error", "Có lỗi khi xử lý đăng nhập Google!");
      navigate("/login");
    }
  }, [navigate, setUserInfo]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
    </div>
  );
}
