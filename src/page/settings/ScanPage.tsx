import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { QRScanner, TitleBar } from "@/constant/Widget";
import { ActionType, MetaletColdRr } from "@/bean/MetaletColdRr";
import { AddressType } from "@metalet/utxo-wallet-service";
import { getRandomID, getStorageWallets, isObserverWalletMode,  } from "@/utils/WalletUtils";
import { WalletBean } from "@/bean/WalletBean";
import { getRandomColorList } from "@/utils/MetaFunUiils";
import {
  AsyncStorageUtil,
  CurrentAccountIDKey,
  CurrentWalletIDKey,
  createStorage,
  wallet_mode_cold,
  wallet_mode_key,
  wallet_mode_observer,
  wallets_key,
} from "@/utils/AsyncStorageUtil";
import { useData } from "@/hooks/MyProvider";
import { navigate } from "@/base/NavigationService";

export default function ScanPage() {
  const { metaletWallet, updateMetaletWallet } = useData();
  const { needInitWallet, updateNeedInitWallet } = useData();
  const storage = createStorage();
  async function parseScan(data) {
    try {
      const result: MetaletColdRr = JSON.parse(data);
      if (result.name === ActionType.CONNECT) {
        Connect(result);
      } else if (result.name === ActionType.SEND_BTC_UN_SIGN) {
        SendBtcUnSign(result);
      } else if (result.name === ActionType.SEND_SPACE_UN_SIGN) {
        SendSpaceUnSign(result);
      }
    } catch (error) {
      console.error("Error parseScan data:", error);
      return null;
    }
  }

  async function SendBtcUnSign(result: MetaletColdRr) {
    // to sign
    console.log(result);
    const isCold = await isObserverWalletMode();
    if (!isCold) {
        
    }

  }

  async function SendSpaceUnSign(result: MetaletColdRr) {
    // to sign
    console.log(result);
  }

  async function Connect(result: MetaletColdRr) {
    //wallet
    let walletName;
    let walletID = Math.random().toString(36).substr(2, 8);
    let wallet_addressType = AddressType.SameAsMvc;
    //account
    let accountName = "Account 1";
    let accountID = Math.random().toString(36).substr(2, 8);
    let accountAddressIndex = 0;
    const wallets = await getStorageWallets();
    walletName = "Wallet " + (wallets.length + 1);
    let walletBean: WalletBean = {
      id: walletID,
      name: walletName,
      mnemonic: "1",
      mvcTypes: 10001,
      isOpen: true,
      addressType: wallet_addressType,
      isBackUp: false,
      isCurrentPathIndex: 0,
      seed: "",
      //dev
      isColdWalletMode: wallet_mode_observer,
      coldPublicKey: result.publicKey,
      coldAddress: result.publicKey,
      accountsOptions: [
        {
          id: accountID,
          name: accountName,
          addressIndex: accountAddressIndex,
          isSelect: true,
          defaultAvatarColor: getRandomColorList(),
        },
      ],
    };
    await storage.set(CurrentWalletIDKey, walletBean.id);
    await storage.set(CurrentAccountIDKey, walletBean.accountsOptions[0].id);
    await AsyncStorageUtil.setItem(wallet_mode_key, wallet_mode_cold);

    const newWallets = [...wallets, walletBean];
    await storage.set(wallets_key, newWallets);
    updateNeedInitWallet(getRandomID());
    navigate("SplashPage");
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View style={{ flex: 1 }}>
          <QRScanner
            handleScan={(data) => {
              parseScan(data);
              console.log(data);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
