import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoundSimButton, TitleBar } from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
import { navigate } from "../base/NavigationService";
import { useData } from "@/hooks/MyProvider";
import {
  getRandomID,
  getStorageCurrentWallet,
  getWalletBeans,
} from "@/utils/WalletUtils";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { useTranslation } from "react-i18next";

export default function CongratulationsPage({ route, props }) {
  const { type } = route.params;
  const { needInitWallet, updateNeedInitWallet } = useData();
  const { needRefreshApp, updateNeedRefreshApp } = useData();

  const {t}=useTranslation();
  useEffect(() => {
    // test();
    updateNeedInitWallet(getRandomID());
  }, []);

  async function test() {
    // await const wallets=getWalletBeans();
    const wallets = await getWalletBeans();
    console.log("wallets: ", JSON.stringify(wallets));

    const wallet = await getStorageCurrentWallet();
    console.log("wallet: ", wallet);
  }

  return (
    <SafeAreaView style={metaStyles.parentContainer}>
      <TitleBar />
      <View style={metaStyles.centerContainer}>
        <Image
          source={require("../../image/meta_congratulations_icon.png")}
          style={{ width: 200, height: 200, marginTop: 50 }}
        />

        <Text style={[metaStyles.largeDefaultText, { marginTop: 20 }]}>
          {type}
        </Text>
        <Text style={[metaStyles.defaultText, { marginTop: 20 }]}>
        {/* {t("w_success_notice")} */}
        </Text>

        <View style={{ flex: 1 }} />

        <RoundSimButton
          title={t("w_start_metalet")}
          event={() => {
            // navigate("Tabs");
            // navigate("SplashPage")
            updateNeedRefreshApp(getRandomID());
            navigate("SplashPage");
          }}
        />
      </View>
    </SafeAreaView>
  );
}
