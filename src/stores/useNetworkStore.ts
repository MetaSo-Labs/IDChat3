import { create } from "zustand";
import { Net } from "@metalet/utxo-wallet-service";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NetworkState {
  network: Net | null;
  switchNetwork: (network: Net) => void;
}

// const storage: StateStorage = {
//   getItem: async (name: string): Promise<string | null> => {
//     console.log(name, "has been retrieved");
//     return (await AsyncStorage.getItem(name)) || null;
//   },
//   setItem: async (name: string, value: string): Promise<void> => {
//     const data= JSON.parse(value);
//     console.log(name, "with value", value, "has been saved");
//     await AsyncStorage.setItem(name, data.state.network);
//   },
//   removeItem: async (name: string): Promise<void> => {
//     console.log(name, "has been deleted");
//     await AsyncStorage.removeItem(name);
//   },
// };

const useNetworkStore = create(
  persist<NetworkState>(
    (set) => ({
      network: null,
      switchNetwork: (network: Net) => set({ network }),
    }),
    {
      name: "net",
      storage: createJSONStorage(() => AsyncStorage),
    }
    // {
    //   name: "net",
    //   storage: createJSONStorage(() => storage),
    // }
    // {
    //   name: "net",
    //   getStorage: () => {
    //     return {
    //       getItem: async (name: string) => {
    //         return (await AsyncStorage.getItem(name));
    //       },
    //       setItem: async (name: string, value: string) => {
    //         const data = JSON.parse(value);
    //         await AsyncStorage.setItem(name, data?.state?.network);
    //       },
    //       removeItem: async (name: string) => {
    //         await AsyncStorage.removeItem(name);
    //       },
    //     };
    //   },
    // }
    // {
    //   name: "net",
    //   getStorage: () => AsyncStorage,
    //   serialize: (data) => data.state.network,
    //   deserialize: (network: Net) => ({ network }),
    // }
  )
);

export default useNetworkStore;
