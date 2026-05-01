import { create } from "zustand";
import { persist } from "zustand/middleware";



type Store = {
    Uemail: string;
    setUemail: (email: string) => void;
}
export const useEmail = create<Store>()(
    persist(
        (set, get) => ({
            Uemail: "",
            setUemail: (email) => set({ Uemail: email })
        }), {
        name: "useEmail"
    }
    ),
);