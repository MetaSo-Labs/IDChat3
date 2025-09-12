import { View, Text, Image, TouchableWithoutFeedback } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitleBar } from "../../constant/Widget";
import * as Clipboard from 'expo-clipboard';
export default function AccountAddressPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />

        <View
          style={{
            flexDirection: "row",
            marginTop: 40,
            marginHorizontal: 10,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../image/logo_btc.png")}
            style={{ width: 35, height: 35, marginLeft: 20 }}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}> BitCoin</Text>
            <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
              {" "}
              sdfewfwsf
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableWithoutFeedback onPress={() => {}}>
            <Image
              source={require("../../../image/meta_copy_icon.png")}
              style={{ width: 20, height: 20, marginRight: 10 }}
            />
          </TouchableWithoutFeedback>
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            marginHorizontal: 10,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../image/logo_mvc.png")}
            style={{ width: 35, height: 35, marginLeft: 20 }}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Microvisionchain
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
              sdfewfwsf
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableWithoutFeedback onPress={() => {
          Clipboard.setString('Address')
          }}>
            <Image
              source={require("../../../image/meta_copy_icon.png")}
              style={{ width: 20, height: 20, marginRight: 10 }}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
}
