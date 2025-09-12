import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CurrentWalletIdState {
  currentWalletId: string | null;
  setCurrentWalletId: (currentAccountId: string) => void;
}

const useWalletIdStore = create(
  persist<CurrentWalletIdState>(
    (set) => ({
      currentWalletId: null,
      setCurrentWalletId: (currentWalletId: string) => set({ currentWalletId }),
    }),
    {
      name: "currentWalletId",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useWalletIdStore;
