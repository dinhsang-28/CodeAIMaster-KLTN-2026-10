// AuthInit.tsx
import React, { useEffect, useState } from "react";
import { useUserInfo } from "../../store/user";
import { GetMe } from "../../api/auth";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { userInfo, setUserInfo } = useUserInfo();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      // ✅ Đã có userInfo (OAuth vừa set hoặc còn trong localStorage) → skip
      if (userInfo) {
        setIsInitializing(false);
        return;
      }

      // Chưa có userInfo → thử restore từ cookie
      try {
        const data = await GetMe();
        setUserInfo(data);
      } catch {
        // ✅ Silent fail — chưa đăng nhập là bình thường
        // KHÔNG clearUserInfo, KHÔNG redirect
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fcfcf9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3a5a40] border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-[#424842]">
          Đang đồng bộ phiên bản...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}