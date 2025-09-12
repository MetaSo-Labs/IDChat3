import { View, Text, Image, TouchableWithoutFeedback } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { metaStyles } from "../../constant/Constants";
import { LoadingModal, TitleBar } from "../../constant/Widget";
import { navigate } from "../../base/NavigationService";
import { createMetaletWallet } from "@/wallet/wallet";
import {
  getRandomID,
  getStorageWallets,
  isNoStorageWallet,
} from "@/utils/WalletUtils";
import MetaletWallet from "@/wallet/MetaletWallet";
import { useData } from "@/hooks/MyProvider";
import {
  CurrentAccountIDKey,
  CurrentWalletIDKey,
  createStorage,
  wallet_mode_cold,
  wallets_key,
} from "@/utils/AsyncStorageUtil";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

export default function AddColdWalletPage() {
  const [isShowLoading, setIsShowLoading] = useState(false);
  const { myWallet, updateMyWallet } = useData();
  const { metaletWallet, updateMetaletWallet } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();
  const { needInitWallet, updateNeedInitWallet } = useData();
  const { t } = useTranslation();

  async function createWallet() {
    setIsShowLoading(true);
    const { btcWallet, mvcWallet, walletBean } = await createMetaletWallet(
      10001,
      wallet_mode_cold
    );
    const wallets = await getStorageWallets();
    const hasNoWallets = await isNoStorageWallet();

    let metaletWallet = new MetaletWallet();
    updateMvcAddress(mvcWallet.getAddress());
    updateBtcAddress(btcWallet.getAddress());
    metaletWallet.currentBtcWallet = btcWallet;
    metaletWallet.currentMvcWallet = mvcWallet;
    updateMetaletWallet(metaletWallet);
    const storage = createStorage();

    if (hasNoWallets) {
      await storage.set(wallets_key, [walletBean]);
    } else {
      console.log("refresh");
      const newWallets = [...wallets, walletBean];
      await storage.set(wallets_key, newWallets);
      updateNeedInitWallet(getRandomID());
    }
    updateMyWallet(walletBean);

    await storage.set(CurrentWalletIDKey, walletBean.id);
    await storage.set(CurrentAccountIDKey, walletBean.accountsOptions[0].id);
    setIsShowLoading(false);

    navigate("CongratulationsColdPage", {
      type: "Successfully created",
    });
  }

  return (
    <SafeAreaView
      style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}
    >
      <LoadingModal
        isShow={isShowLoading}
        isCancel={true}
        event={() => {
          setIsShowLoading(false);
        }}
      />
      <View style={metaStyles.varContainer}>
        <TitleBar />
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 20,
              marginLeft: 20,
            }}
          >
            {t("s_add_cold_wallet")}
          </Text>

          <TouchableWithoutFeedback
            onPress={() => {
              createWallet();
            }}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20,
                  marginVertical: 20,
                  backgroundColor: "#F5F7F9",
                  borderRadius: 10,
                  padding: 10,
                  height: 123,
                },
              ]}
            >
              <View>
                <Text
                  style={{ fontSize: 16, color: "#333", fontWeight: "bold" }}
                >
                  {t("m_create_wallet")}
                </Text>
                <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                  {t("m_create_wallet_notice")}
                </Text>
              </View>

              <View style={{ flex: 1 }}></View>
              <Image
                source={require("../../../image/metalet_create_wallet_icon.png")}
                style={{ height: 100, width: 100, resizeMode: "contain" }}
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              // navigate("ImportWalletPage");
              navigate("ImportWalletNetPage", { type: wallet_mode_cold });
            }}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 20,
                  marginVertical: 20,
                  backgroundColor: "#F5F7F9",
                  borderRadius: 10,
                  padding: 10,
                  height: 123,
                },
              ]}
            >
              <View>
                <Text
                  style={{ fontSize: 16, color: "#333", fontWeight: "bold" }}
                >
                  {t("m_import_wallet")}
                </Text>
                <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                  {t("m_import_wallet_notice")}
                </Text>
              </View>

              <View style={{ flex: 1 }}></View>
              <Image
                source={require("../../../image/metalet_import_wallet_icon.png")}
                style={{ height: 80, width: 100, resizeMode: "contain" }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
}
