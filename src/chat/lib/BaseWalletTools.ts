import { useData } from '@/hooks/MyProvider';
import { getCurrentWalletAccount, getStorageCurrentWallet } from '@/utils/WalletUtils';
import { getCurrentBtcWallet, getCurrentMvcWallet } from '@/wallet/wallet';
import { BtcWallet, MvcWallet } from '@metalet/utxo-wallet-service';

export async function initBaseChatWallet(): Promise<BaseWalletTools> {
  const mvcWallet = await getCurrentMvcWallet();
  const currentBtcWallet = await getCurrentBtcWallet();
  
  return { currentMvcWallet: mvcWallet, currentBtcWallet: currentBtcWallet };
}

export interface BaseWalletTools {
  currentMvcWallet: MvcWallet;
  currentBtcWallet: BtcWallet;
}
