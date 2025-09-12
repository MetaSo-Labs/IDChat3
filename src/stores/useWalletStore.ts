import { WalletMap } from "@/lib/types/wallet";
import { create } from "zustand";
import {
  Chain,
  BtcWallet,
  MvcWallet,
} from "@metalet/utxo-wallet-service";

interface WalletState {
  btcWallet: BtcWallet | null;
  mvcWallet: MvcWallet | null;
  setCurrentWallet: (wallets: {
    btcWallet: BtcWallet;
    mvcWallet: MvcWallet;
  }) => void;
  setCurrentChainWallet: <T extends Chain>(
    chain: T,
    wallet: WalletMap[T]
  ) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  btcWallet: null,
  mvcWallet: null,
  setCurrentWallet: ({
    btcWallet,
    mvcWallet,
  }: {
    btcWallet: BtcWallet;
    mvcWallet: MvcWallet;
  }) => set({ btcWallet, mvcWallet }),
  setCurrentChainWallet: <T extends Chain>(chain: T, wallet: WalletMap[T]) => {
    if (chain === Chain.BTC) {
      set({ btcWallet: wallet as BtcWallet });
    } else if (chain === Chain.MVC) {
      set({ mvcWallet: wallet as MvcWallet });
    } else {
      throw new Error("Invalid chain");
    }
  },
}));

export default useWalletStore;
