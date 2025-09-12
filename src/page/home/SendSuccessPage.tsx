import { View, Text, Image, TouchableWithoutFeedback } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CircleAvatar,
  CircleAvatarLetter,
  RoundSimButton,
  TitleBar,
} from "../../constant/Widget";
import { navigate } from "../../base/NavigationService";
import { metaStyles } from "@/constant/Constants";
import { goToWebScan } from "@/utils/WalletUtils";
import { network_btc } from "@/utils/AsyncStorageUtil";
import { getBtcBrc20Icon } from "@/utils/AssertUtils";
import { useTranslation } from "react-i18next";

export default function SendSuccessPage({ route }) {
  const { result } = route.params;
  const [isErrorIcon, setisErrorIcon] = useState(false);
  const { t } = useTranslation();

  let ImageUrl = getBtcBrc20Icon(result.symbol);
  if (!ImageUrl) {
    ImageUrl = "1";
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar
          event={() => {
            navigate("HomePage");
          }}
        />
        <View
          style={{
            justifyContent: "center",
            margin: 20,
            alignItems: "center",
            padding: 20,
          }}
        >
          <Image
            source={require("../../../image/pay_success_icon.png")}
            style={{ width: "40%", height: 120 }}
          />

          <Text
            style={{
              color: "#333",
              marginTop: 30,
              fontSize: 25,
              fontWeight: "bold",
            }}
          >
            {t("c_send_success")}
          </Text>

          <View
            style={{
              margin: 20,
              padding: 20,
              backgroundColor: "#fff",
              borderRadius: 10,
              width: "100%",
            }}
          >
            <Text style={{ color: "#666", fontSize: 14 }}> Send Amount</Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              {/* <Image
                source={require("../../../image/logo_space.png")}
                style={{ width: 36, height: 36 }}
              /> */}

              {isErrorIcon ? (
                <CircleAvatarLetter
                  widthC={36}
                  heightC={36}
                  letterStr={result.symbol.substring(0, 1)}
                />
              ) : (
                <CircleAvatar
                  widthC={36}
                  heightC={36}
                  imageUrl={ImageUrl}
                  event={() => {
                    setisErrorIcon(true);
                    // refreshData(brc20.txid);
                  }}
                />
              )}

              <Text style={{ color: "#000", fontSize: 16, marginLeft: 10 }}>
                {result.amount} {result.symbol}
              </Text>
            </View>

            <View
              style={{
                marginVertical: 20,
                backgroundColor: "#F5F7F9",
                height: 1,
              }}
            />

            <Text style={{ color: "#666", fontSize: 14 }}>
            {t("c_receiving_address")}
            </Text>
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../../image/send_receiver_wallet_icon.png")}
                style={{ width: 36, height: 36 }}
              />
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  marginLeft: 10,
                  marginRight: 20,
                }}
              >
                {result.address}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableWithoutFeedback
          onPress={() => {
            console.log("click");
            goToWebScan(result.chain, result.txid);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={metaStyles.smallDefaultText}>
            {t("c_view_on_blockchain")}
            </Text>
            <Image
              source={require("../../../image/link_ins_icon.png")}
              style={{ width: 15, height: 15, marginLeft: 2 }}
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={{ marginTop: 20, marginHorizontal: 40, marginBottom: 20 }}>
          <RoundSimButton
           title={t("c_done")}
            textColor="#fff"
            event={() => {
              navigate("HomePage");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
