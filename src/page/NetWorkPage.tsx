import { View, Text, TouchableWithoutFeedback, Image } from "react-native";
import React from "react";
import { GradientAvatar, TitleBar } from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
import { useData } from "../hooks/MyProvider";
import {
  network_all,
  network_btc,
  network_key,
  network_mvc,
  createStorage,
  network_doge,
} from "../utils/AsyncStorageUtil";
import { eventBus, refreshHomeLoadingEvent } from "../utils/EventBus";
import { navigate } from "../base/NavigationService";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const storage = createStorage();

export default function NetWorkPage() {
  const { netWork, updateNetWork } = useData();
  const { t } = useTranslation();

  async function changeNetwork(changeNetwork: string) {
    if (changeNetwork == network_mvc) {
      await storage.set(network_key, network_mvc);
      // await AsyncStorageUtil.setItem(network_key, network_mvc);
    } else if (changeNetwork == network_btc) {
      await storage.set(network_key, network_btc);
      // await AsyncStorageUtil.setItem(network_key, network_btc);
    } else if (changeNetwork == network_doge) {
      await storage.set(network_key, network_doge);
      // await AsyncStorageUtil.setItem(network_key, network_btc);
    }  
    else if (changeNetwork == network_all) {
      await storage.set(network_key, network_all);
      // await AsyncStorageUtil.setItem(network_key, network_all);
    }
    // eventBus.publish(refreshHomeLoadingEvent,{data:''})
    navigate("Tabs");
    console.log("切换网络成功"+changeNetwork);
    updateNetWork(changeNetwork);

    //
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* <TitleBar title="Select Network" /> */}
        <TitleBar title={t("o_select_network")} />

        <TouchableWithoutFeedback
          onPress={() => {
            changeNetwork(network_all);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 40,
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Image
              source={require("../../image/metalet_network_all_icon.png")}
              style={{ width: 30, height: 30 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={metaStyles.defaultText}> {t("o_all_networks")}</Text>
              {/* <Text style={{ marginTop: 10 }}>{}</Text> */}
            </View>

            <View style={{ flex: 1 }} />

            {network_all == netWork && (
              <Image
                source={require("../../image/wallets_select_icon.png")}
                style={{ padding: 8, width: 15, height: 15 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            changeNetwork(network_btc);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 25,
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Image
              source={require("../../image/meta_btc_icon.png")}
              style={{ width: 30, height: 30 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={metaStyles.defaultText}> Bitcoin</Text>
              {/* <Text style={{ marginTop: 10 }}>{}</Text> */}
            </View>

            <View style={{ flex: 1 }} />

            {netWork == network_btc && (
              <Image
                source={require("../../image/wallets_select_icon.png")}
                style={{ padding: 8, width: 15, height: 15 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            changeNetwork(network_mvc);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 25,
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Image
              source={require("../../image/logo_space.png")}
              style={{ width: 30, height: 30 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={metaStyles.defaultText}> Microvisionchain</Text>
              <View
                style={{
                  marginTop: 3,
                  backgroundColor: "rgba(247, 147, 26, 0.2)",
                  borderRadius: 10,
                  width: 90,
                  alignItems: "center",
                  paddingVertical: 2,
                  marginLeft: 5,
                }}
              >
                <Text style={{ fontSize: 8, color: "#FF981C" }}>
                  Bitcoin sidechain{" "}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {network_mvc == netWork && (
              <Image
                source={require("../../image/wallets_select_icon.png")}
                style={{ padding: 8, width: 15, height: 15 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            changeNetwork(network_doge);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 25,
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Image
              source={require("../../image/doge_logo.png")}
              style={{ width: 30, height: 30 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={metaStyles.defaultText}> DOGE</Text>
              <View
                style={{
                  marginTop: 3,
                  backgroundColor: "rgba(247, 147, 26, 0.2)",
                  borderRadius: 10,
                  width: 90,
                  alignItems: "center",
                  paddingVertical: 2,
                  marginLeft: 5,
                }}
              >
                <Text style={{ fontSize: 8, color: "#FF981C" }}>
                  Bitcoin sidechain{" "}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            {network_mvc == netWork && (
              <Image
                source={require("../../image/wallets_select_icon.png")}
                style={{ padding: 8, width: 15, height: 15 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

      </View>
    </SafeAreaView>
  );
}
