import { create } from "zustand";
import { persist } from "zustand/middleware";
type Store = {
  countQuantityCart: number;
  setQuantityCart: (totalProducts: number) => void;
};

export const useUserCart = create<Store>()(
  persist(
    (set, get) => ({
      countQuantityCart: 0,
      setQuantityCart: (totalProducts) =>
        set({ countQuantityCart: totalProducts }),
    }),
    {
      name: "userCart", // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
