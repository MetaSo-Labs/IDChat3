import { WalletMap } from "@/lib/types/wallet";
import { getCurrentAccountId } from "@/lib/account";
import useWalletStore from "@/stores/useWalletStore";
import useNetworkStore from "@/stores/useNetworkStore";
import { useState, useCallback, useEffect } from "react";
import {
  Chain,
  AddressType,
  WalletManager,
} from "@metalet/utxo-wallet-service";
import {
  getBtcAddressType,
  getCurrentWalletId,
  getWalletOnlyAccount,
  getWalletOtherAccounts,
  getActiveWalletOnlyAccount,
  getActiveWalletOtherAccounts,
} from "@/lib/wallet";

const useWalletManager = () => {
  const { network } = useNetworkStore();
  const { setCurrentWallet } = useWalletStore();
  const [walletManager, setWalletManager] = useState<WalletManager>(null);

  const initWalletManager: () => Promise<WalletManager> =
    useCallback(async () => {
      if (network === null) {
        return;
      }
      try {
        // console.log("network", network);

        // const t1 = performance.now();
        const activeWallet = await getActiveWalletOnlyAccount();
        // const t2 = performance.now();
        // console.log("getActiveWalletOnlyAccount", t2 - t1);

        // const t3 = performance.now();
        const walletsOptions = [
          {
            id: activeWallet.id,
            name: activeWallet.name,
            mnemonic: activeWallet.mnemonic,
            mvcTypes: [activeWallet.mvcTypes],
            seed: activeWallet.seed
              ? Buffer.from(activeWallet.seed, "hex")
              : undefined,
            accountsOptions: activeWallet.accountsOptions.map(
              ({ id, name, addressIndex }) => ({ id, name, addressIndex })
            ),
          },
        ];
        const walletManager = new WalletManager({ network, walletsOptions });

        const chainWallets = walletManager.getAccountChainWallets(
          activeWallet.id,
          activeWallet.accountsOptions[0].id
        );

        const currentWalletId = await getCurrentWalletId();
        const btcAddressType = await getBtcAddressType(currentWalletId);

        const btcWallet = chainWallets.btc.find(
          (wallet) => wallet.getAddressType() === btcAddressType
        );

        if (!btcWallet) {
          // throw new Error(`No ${btcAddressType} btc wallet found.`);
        }

        const mvcWallet = chainWallets.mvc.find(
          (wallet) => wallet.getAddressType() === AddressType.LegacyMvc
        );

        if (!mvcWallet) {
          // throw new Error(`No ${AddressType.LegacyMvc} mvc wallet found.`);
        }

        setCurrentWallet({ btcWallet, mvcWallet });

        // const t4 = performance.now();
        // console.log("walletManager", t4 - t3);

        setWalletManager(walletManager);
        loadActiveWalletOtherAccounts(walletManager);
        return walletManager;
      } catch (err) {
        console.error(err.message);
        // throw err;
      }
    }, [network]);

  useEffect(() => {
    // console.log("useWalletManager", network);

    initWalletManager();
    // .then((walletManager) => {
    //   console.log("wallets", walletManager.getWallets());
    // });
  }, [network, initWalletManager]);

  const loadActiveWalletOtherAccounts = useCallback(
    async (walletManager: WalletManager) => {
      const activeWallet = await getActiveWalletOtherAccounts();
      for (const account of activeWallet.accountsOptions) {
        walletManager.addAccount(activeWallet.id, {
          id: account.id,
          name: account.name,
          addressIndex: account.addressIndex,
        });
      }
    },
    []
  );

  const addWalletOnlyAccount = useCallback(
    async (walletId, accountId) => {
      const wallet = await getWalletOnlyAccount(walletId, accountId);
      walletManager.addWallet({
        id: wallet.id,
        name: wallet.name,
        mnemonic: wallet.mnemonic,
        mvcTypes: [wallet.mvcTypes],
        accountsOptions: wallet.accountsOptions.map(
          ({ id, name, addressIndex }) => ({
            id,
            name,
            addressIndex,
          })
        ),
      });
    },
    [walletManager]
  );

  const loadWalletOtherAccounts = useCallback(
    async (walletId, accountId) => {
      const wallet = await getWalletOtherAccounts(walletId, accountId);
      if (!wallet) {
        // throw new Error("No wallet found. Please select a wallet.");
      }
      if (walletManager === null) {
        // throw new Error("Wallet manager not initialized.");
      }

      for (let account of wallet.accountsOptions) {
        walletManager.addAccount(wallet.id, {
          id: account.id,
          name: account.name,
          addressIndex: account.addressIndex,
        });
      }
    },
    [walletManager]
  );

  const getAccountChainWallets = useCallback(async () => {
    try {
      const currentWalletId = await getCurrentWalletId();
      const currentAccountId = await getCurrentAccountId();

      if (walletManager === null) {
        console.error("Wallet manager not initialized.");
        // throw new Error("Wallet manager not initialized.");
      }

      return (
        walletManager.getAccountChainWallets(
          currentWalletId,
          currentAccountId
        ) || {}
      );
    } catch (error) {
      console.error("getAccountChainWallets Error :", error);
      // throw error;
    }
  }, [walletManager]);

  const getCurrentChainWallet: <T extends Chain>(
    chain: T
  ) => Promise<WalletMap[T]> = useCallback(
    async (chain: Chain) => {
      // const t1 = performance.now();
      const accountChainWallets = await getAccountChainWallets();
      const chainWallets = accountChainWallets[chain];
      // const t2 = performance.now();
      // console.log("getAccountChainWallets", t2 - t1);

      if (!chainWallets) {
        console.error("No chain wallets found.");
        // throw new Error("No chain wallets found.");
      }
      // const t3 = performance.now();
      const currentWalletId = await getCurrentWalletId();

      // const t4 = performance.now();
      // console.log("getCurrentWalletId", t4 - t3);

      // const t5 = performance.now();

      const addressType =
        chain === Chain.MVC
          ? AddressType.LegacyMvc
          : await getBtcAddressType(currentWalletId);

      // const t6 = performance.now();
      // console.log("getBtcAddressType", t6 - t5);

      // const t7 = performance.now();

      const chainWallet = chainWallets.find(
        (wallet) => wallet.getAddressType() === addressType
      );

      // const t8 = performance.now();
      // console.log("find chain wallet", t8 - t7);

      if (!chainWallet) {
        // throw new Error(`No ${addressType} wallet found.`);
        console.log("No chain wallet found.");
        
      }
      return chainWallet;
    },
    [getAccountChainWallets]
  );

  const getWallets = useCallback(async () => {
    if (walletManager === null) {
      // throw new Error("Wallet manager not initialized.");
    }
    console.log("wallets", JSON.stringify(walletManager.getWallets()));
  }, [walletManager]);

  return {
    getWallets,
    walletManager,
    initWalletManager,
    addWalletOnlyAccount,
    getCurrentChainWallet,
    getAccountChainWallets,
    loadWalletOtherAccounts,
  };
};

export default useWalletManager;
