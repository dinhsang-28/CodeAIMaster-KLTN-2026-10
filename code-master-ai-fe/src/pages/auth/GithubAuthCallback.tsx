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

      setUserInfo(user);
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
