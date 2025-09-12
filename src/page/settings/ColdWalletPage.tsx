import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyQrCode, QRScanner, TitleBar } from "@/constant/Widget";
import { goBack, navigate } from "@/base/NavigationService";
import { useData } from "@/hooks/MyProvider";
import { ActionType, MetaletColdRr } from "@/bean/MetaletColdRr";
import { AddressType } from "@metalet/utxo-wallet-service";
import { getRandomID, getStorageWallets } from "@/utils/WalletUtils";
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
import { useTranslation } from "react-i18next";

export default function ColdWalletPage() {
  const { width } = Dimensions.get("window");
  const [isScan, setIsScan] = useState(false);
  const { metaletWallet, updateMetaletWallet } = useData();
  const { needInitWallet, updateNeedInitWallet } = useData();
  const { walletMode, updateWalletMode } = useData();

  const { t } = useTranslation();

  let qrData = "1";
  // let publicKey = metaletWallet.currentBtcWallet.getAddress();currentMvcWallet
  let publicKey = metaletWallet.currentBtcWallet.getPublicKey().toString("hex");
  const qrDataReady: MetaletColdRr = {
    name: ActionType.CONNECT,
    publicKey: publicKey,
    address:metaletWallet.currentBtcWallet.getAddress()
  };

  qrData = JSON.stringify(qrDataReady);

  console.log("qrData", qrData);
  const storage = createStorage();

  async function parseScan(data) {
    try {
      const result: MetaletColdRr = JSON.parse(data);
      if (result.name === ActionType.CONNECT) {
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
          coldAddress: result.address,
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
        await storage.set(
          CurrentAccountIDKey,
          walletBean.accountsOptions[0].id
        );
        await AsyncStorageUtil.setItem(wallet_mode_key, wallet_mode_cold);

        const newWallets = [...wallets, walletBean];
        await storage.set(wallets_key, newWallets);
        updateNeedInitWallet(getRandomID());
        navigate("SplashPage");
        
        console.log("walletBean", walletBean);
        
      }
    } catch (error) {
      console.error("Error parseScan data:", error);
      return null;
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {isScan ? (
        <QRScanner
          handleScan={(data) => {
            // setInputAddress("");
            // setInputAddress(data);
            parseScan(data);
            setIsScan(false);
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              marginLeft: 20,
              marginTop: 5,
              height: 44,
              alignItems: "center",
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                goBack();
              }}
            >
              <Image
                source={require("../../../image/meta_back_icon.png")}
                style={{ width: 22, height: 22 }}
              />
            </TouchableWithoutFeedback>
            <Text
              style={[
                {
                  textAlign: "center",
                  marginRight: 40,
                  marginLeft: 15,
                  flex: 1,
                  color: "#333333",
                  fontSize: 18,
                  fontWeight: "bold",
                },
              ]}
            ></Text>

            <TouchableWithoutFeedback
              onPress={() => {
                setIsScan(true);
              }}
            >
              <Image
                source={require("../../../image/scan_icon.png")}
                style={{ width: 25, height: 25 }}
              />
            </TouchableWithoutFeedback>
            <Text
              style={{ marginRight: 20, color: "#333", fontSize: 16 }}
            ></Text>
          </View>
          <View style={{ padding: 20 }}>
            
            {/* <View
              style={{
                justifyContent: "center",
                backgroundColor: "#fff",
                margin: 20,
                borderRadius: 10,
                alignItems: "center",
                padding: 20,
              }}
            >
              <View style={{ marginTop: 40 }}>
                <MyQrCode qrData={qrData} size={width - 130} />
              </View>
            </View> */}
          </View>

          <View style={{ margin: 20 }}>
            <Text
              style={{
                color: "#333",
                lineHeight: 20,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {/* {t("s_cold_wallet")} */}
              {t("s_cold_use_guide")}
            </Text>

            <Text
              style={{
                color: "#666",
                lineHeight: 22,
                marginTop: 10,
                fontSize: 14,
              }}
            >
              {t("s_cold_wallet_notice")}
              {/* 1.Create/Restore Wallet on an Offline Phone. {"\n"}
              2.Scan the offline phone's QR code with an online phone to create
              a watch-only wallet. {"\n"}
              3.Try Sending and Receiving Transactions Using the Watch-Only
              Wallet. */}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
