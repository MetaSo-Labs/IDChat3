import { getCurrentAccountId } from "./account";
import { Wallet, WalletMap } from "./types/wallet";
import useWalletStore from "@/stores/useWalletStore";
import { Chain, AddressType } from "@metalet/utxo-wallet-service";
import {
  createStorage,
  wallets_key,
  CurrentWalletIDKey,
} from "@/utils/AsyncStorageUtil";
import { getStorageCurrentWallet } from "@/utils/WalletUtils";

const storage = createStorage();

export async function hasWallets(): Promise<boolean> {
  return !!(await storage.get<Wallet[]>(wallets_key));
}

export async function getWallets() {
  return await storage.get<Wallet[]>(wallets_key, {
    defaultValue: [],
  });
}

export async function getBtcAddressType(walletId: string) {
  const wallets = await storage.get<Wallet[]>(wallets_key, {
    defaultValue: [],
  });
  if (wallets.length === 0) {
    throw new Error("no wallets");
  }
  const wallet = wallets.find((w) => w.id === walletId);
  if (wallet) {
    return wallet.addressType || AddressType.SameAsMvc;
  }
  return AddressType.SameAsMvc;
}

export async function getCurrentWalletId() {
  const currentWalletId = await storage.get(CurrentWalletIDKey);
  if (!currentWalletId) {
    throw new Error("No current wallet found. Please select a wallet.");
  }
  return currentWalletId;
}

export async function getWalletOnlyAccount(
  walletId: string,
  accountId: string
) {
  if (!walletId) {
    throw new Error("wallet id not found");
  }
  const wallets = await getWallets();
  if (!wallets.length) {
    throw new Error("wallets not found");
  }
  const wallet = wallets.find((wallet) => wallet.id === walletId);
  if (!wallet) {
    throw new Error("Plese select a wallet first.");
  }

  const { accountsOptions: accounts } = wallet;
  if (!accounts || !accounts.length) {
    throw new Error("wallet does not have any accounts");
  }

  if (!accountId) {
    throw new Error("account id not found");
  }
  const account = accounts.find((account) => account.id === accountId);
  if (!account) {
    throw new Error("current account not found");
  }
  wallet.accountsOptions = [account];
  return wallet;
}

export async function getActiveWalletOnlyAccount() {
  const currentWalletId = await getCurrentWalletId();
  if (!currentWalletId) {
    throw new Error("current wallet id not found");
  }
  const currentAccountId = await getCurrentAccountId();
  if (!currentAccountId) {
    throw new Error("current account id not found");
  }
  return getWalletOnlyAccount(currentWalletId, currentAccountId);
}

export async function getWalletOtherAccounts(
  walletId: string,
  accountId: string
) {
  if (!walletId) {
    throw new Error("wallet id not found");
  }
  const wallets = await getWallets();
  if (!wallets.length) {
    throw new Error("wallets not found");
  }
  const wallet = wallets.find((wallet) => wallet.id === walletId);
  if (!wallet) {
    throw new Error("wallet not found");
  }

  const { accountsOptions: accounts } = wallet;
  if (!accounts || !accounts.length) {
    throw new Error("wallet does not have any accounts");
  }

  if (!accountId) {
    throw new Error("current account id not found");
  }
  wallet.accountsOptions = accounts.filter(
    (account) => account.id !== accountId
  );
  return wallet;
}

export async function getActiveWalletOtherAccounts() {
  const walletId = await getCurrentWalletId();
  if (!walletId) {
    throw new Error("current wallet id not found");
  }
  const currentAccountId = await getCurrentAccountId();
  if (!currentAccountId) {
    throw new Error("current account id not found");
  }
  return getWalletOtherAccounts(walletId, currentAccountId);
}

export function getCurrentWallet<T extends Chain>(chain: T): WalletMap[T] {
  if (chain === Chain.MVC) {
    if (!useWalletStore.getState().mvcWallet) {
      throw new Error("MVC Wallet is not initialized.");
    }
    return useWalletStore.getState().mvcWallet;
  } else if (chain === Chain.BTC) {
    if (!useWalletStore.getState().btcWallet) {
      throw new Error("BTC Wallet is not initialized.");
    }
    return useWalletStore.getState().btcWallet;
  }
  throw new Error(`Chain ${chain} is not supported`);
}


export async function getActiveWallet() {
  // const currentWalletId = await getCurrentWalletId()
  // if (!currentWalletId) {
  //   throw new Error('currentWalletId id not found')
  // }
  // const wallets = await getV3EncryptedWallets()
  // if (!wallets.length) {
  //   throw new Error('wallets not found')
  // }
  // let wallet = wallets.find((wallet) => wallet.id === currentWalletId)
  // if (!wallet) {
  //   throw new Error('wallets not found')
  // }
  const wallet = await getStorageCurrentWallet()
  return wallet
}
