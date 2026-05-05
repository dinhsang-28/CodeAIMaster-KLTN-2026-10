import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../../utils/showMessages";
import { useUserInfo } from "../../store/user";

export default function GithubAuthCallback() {
  const navigate = useNavigate();
  const { setUserInfo } = useUserInfo();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const userString = params.get("user");
      console.log("userString", userString);

      if (!userString) {
        showMessage("error", "Đăng nhập GitHub thất bại!");
        navigate("/login");
        return;
      }

      const user = JSON.parse(decodeURIComponent(userString));
       const { accessToken, refreshToken, ...userInfoClean } = user;

      if (accessToken) {
      document.cookie = `access_token=${accessToken}; path=/; max-age=900;SameSite=None; Secure`;
    }
    if (refreshToken) {
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800;SameSite=None; Secure`;
    }
      // if (user.accessToken && user.refreshToken) {
      //   // Lưu Access Token (Sống 15 phút - 900 giây)
      //   document.cookie = `access_token=${user.accessToken}; path=/; max-age=900; SameSite=Lax; Secure`;
      //   // Lưu Refresh Token (Sống 7 ngày - 604800 giây)
      //   document.cookie = `refresh_token=${user.refreshToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
      // }

      // // Dọn dẹp token khỏi object trước khi lưu vào Zustand để bảo mật
      // delete user.accessToken;
      // delete user.refreshToken;

      setUserInfo(userInfoClean);
      showMessage("success", "Đăng nhập GitHub thành công!");
      navigate("/");
    } catch (error) {
      console.error("Github callback error:", error);
      showMessage("error", "Có lỗi khi xử lý đăng nhập GitHub!");
      navigate("/login");
    }
  }, [navigate, setUserInfo]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
    </div>
  );
}
