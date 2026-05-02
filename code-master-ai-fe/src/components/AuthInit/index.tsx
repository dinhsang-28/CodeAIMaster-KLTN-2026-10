// AuthInit.tsx
import React, { useEffect, useState } from "react";
import { useUserInfo } from "../../store/user";
import { GetMe } from "../../api/auth";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { setUserInfo, clearUserInfo } = useUserInfo();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await GetMe();
        setUserInfo(data);
      } catch (error) {
        clearUserInfo();
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [ setUserInfo, clearUserInfo]);
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#fcfcf9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3a5a40] border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-[#424842]">Đang đồng bộ phiên bản...</p>
      </div>
    );
  }

  return <>{children}</>;
}