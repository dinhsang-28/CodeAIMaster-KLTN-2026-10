import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
  email?: string;
  _id: string;
  name: string;
  permissions: string[];
  phone: string;
  address: string;
  image: string;
}

type Store = {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo) => void;
  clearUserInfo: () => void;
};

export const useUserInfo = create<Store>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info }),
      clearUserInfo: () => set({ userInfo: null }),
    }),
    {
      name: "userInfo", // ten key luu trong localStorage
    }
  )
);