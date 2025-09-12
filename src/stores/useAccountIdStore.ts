import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CurrentAccountIdState {
  currentAccountId: string | null;
  setCurrentAccountId: (currentAccountId: string) => void;
}

const useAccountIdStore = create(
  persist<CurrentAccountIdState>(
    (set) => ({
      currentAccountId: null,
      setCurrentAccountId: (currentAccountId: string) =>
        set({ currentAccountId }),
    }),
    {
      name: "currentAccountId",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAccountIdStore;
