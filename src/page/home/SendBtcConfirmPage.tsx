import { View, Text,Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitleBar } from "../../constant/Widget";

export default function SendBtcConfirmPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View
          style={{
            justifyContent: "center",
            margin: 20,
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
              marginTop: 20,
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
           0.01 BTC
          </Text>

        </View>
      </View>
    </SafeAreaView>
  );
}
