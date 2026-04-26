import React, { useEffect, useState } from "react";
import { useUserInfo } from "../../store/user";
import { GetMe } from "../../api/auth";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { userInfo, setUserInfo, clearUserInfo } = useUserInfo();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      // Nếu userInfo vẫn còn trong LocalStorage -> Cho qua luôn, không cần gọi API
      if (userInfo) {
        setIsInitializing(false);
        return;
      }
      // Nếu mất userInfo (lỡ tay xóa), thử "cứu" lại bằng cách gọi API
      try {
        // Gửi request, Cookie HttpOnly tự động được đính kèm
        const data = await GetMe();
        
        // Lưu lại vào Zustand (và Zustand sẽ tự lưu lại vào LocalStorage)
        setUserInfo(data); 
      } catch (error) {
        //  Nếu lấy thông tin thất bại (Cookie thực sự đã hết hạn hoặc bị xóa)
        // Interceptor sẽ tự đá ra /login, ta chỉ cần clear rác trong store
        clearUserInfo();
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [userInfo, setUserInfo, clearUserInfo]); 

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fcfcf9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3a5a40] border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-[#424842]">Đang đồng bộ phiên bản...</p>
      </div>
    );
  }

  // Hoàn tất khôi phục -> Render toàn bộ App
  return <>{children}</>;
}