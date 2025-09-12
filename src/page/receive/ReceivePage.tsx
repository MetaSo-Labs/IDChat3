import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingNoticeModal, MyQrCode, TitleBar } from "../../constant/Widget";
import * as Clipboard from "expo-clipboard";
import { useData } from "../../hooks/MyProvider";
import { wallet_mode_cold } from "@/utils/AsyncStorageUtil";
import { useTranslation } from "react-i18next";

export default function ReceivePage({ route }) {
  const { width } = Dimensions.get("window");
  const { metaletWallet, updateMetaletWallet } = useData();
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Copy successful");
  const { walletMode, updateWalletMode } = useData();
  const { myCoinType } = route.params;
  const { btcAddress, updateBtcAddress } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { t } = useTranslation();

  function ShowNotice(notice) {
    Clipboard.setString(notice);
    // setNoticeContent("Copy Successful");
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 800);
  }

  let isCold = walletMode === wallet_mode_cold;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

      <View style={{ flex: 1 }}>
        <TitleBar />
        {myCoinType == "BTC" && (
          <View
            style={{
              justifyContent: "center",
              backgroundColor: "#fff",
              margin: 20,
              borderRadius: 10,
              alignItems: "center",
              padding: 20,
            }}
          >
            <Image
              source={require("../../../image/receive_btc_icon.png")}
              style={{ width: 70, height: 70 }}
            />

            <Text
              style={{
                color: "#333",
                textAlign: "center",
                lineHeight: 20,
                marginTop: 40,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              BTC
            </Text>

            <Text
              style={{
                color: "#666",
                textAlign: "center",
                lineHeight: 20,
                marginTop: 20,
                fontSize: 14,
              }}
            >
             {t("o_receive_btc_notice")}
            </Text>

            <View style={{ marginTop: 40 }}>
              {/* <MyQrCode qrData={metaletWallet.currentBtcWallet.getAddress()} size={width - 130} /> */}
              <MyQrCode qrData={btcAddress} size={width - 130} />
            </View>

            <TouchableWithoutFeedback
              onPress={() => {
                // ShowNotice(metaletWallet.currentBtcWallet.getAddress());
                ShowNotice(btcAddress);
                // updateBtcAddress(btcAddress);

                // Clipboard.setString(
                //   metaletWallet.currentBtcWallet.getAddress()
                // );
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 40,
                  marginBottom: 20,
                  marginHorizontal: 30,
                  borderWidth: 1,
                  borderColor: "rgba(191, 194, 204, 0.5)",
                  borderRadius: 5,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text numberOfLines={1} ellipsizeMode="middle" style={{}}>
                  {/* {metaletWallet.currentBtcWallet.getAddress()} */}
                  {btcAddress}
                </Text>

                <View style={{ flex: 1 }} />

                <Image
                  source={require("../../../image/meta_copy_icon.png")}
                  style={{ width: 20, height: 20, marginLeft: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}

        {myCoinType == "SPACE" && (
          <View
            style={{
              justifyContent: "center",
              backgroundColor: "#fff",
              margin: 20,
              borderRadius: 10,
              alignItems: "center",
              padding: 20,
            }}
          >
            {myCoinType == "BTC" && (
              <Image
                source={require("../../../image/receive_btc_icon.png")}
                style={{ width: 70, height: 70 }}
              />
            )}

            {myCoinType == "SPACE" && (
              <Image
                source={require("../../../image/receive_mvc_icon.png")}
                style={{ width: 70, height: 70 }}
              />
            )}

            <Text
              style={{
                color: "#333",
                textAlign: "center",
                lineHeight: 20,
                marginTop: 40,
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              SPACE
            </Text>

            <Text
              style={{
                color: "#666",
                textAlign: "center",
                lineHeight: 20,
                marginTop: 20,
                fontSize: 14,
              }}
            >
              {t("o_receive_mvc_notice")}
            </Text>

            <View style={{ marginTop: 40 }}>
              {/* <MyQrCode qrData={metaletWallet.currentMvcWallet.getAddress()} size={width - 130} /> */}
              <MyQrCode qrData={mvcAddress} size={width - 130} />
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                //   Clipboard.setString("Address");
                // ShowNotice(metaletWallet.currentMvcWallet.getAddress());
                ShowNotice(mvcAddress);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 40,
                  marginBottom: 20,
                  marginHorizontal: 30,
                  borderWidth: 1,
                  borderColor: "rgba(191, 194, 204, 0.5)",
                  borderRadius: 5,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <Text numberOfLines={1} ellipsizeMode="middle">
                  {/* {metaletWallet.currentMvcWallet.getAddress()} */}
                  {mvcAddress}
                </Text>

                <View style={{ flex: 1 }} />

                <Image
                  source={require("../../../image/meta_copy_icon.png")}
                  style={{ width: 20, height: 20, marginLeft: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
