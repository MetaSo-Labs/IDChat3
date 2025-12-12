import { View, Text, Image, TouchableWithoutFeedback } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitleBar } from "../../constant/Widget";
import * as Clipboard from "expo-clipboard";
import { navigate } from "../../base/NavigationService";
import { useData } from "../../hooks/MyProvider";

export default function SendSelectAssertPage() {

    const { metaletWallet, updateMetaletWallet } = useData();


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar title={"Select Asset"} />


        <TouchableWithoutFeedback
          onPress={() => {
            // navigate("ReceivePage",{myCoinType:{type:'BTC'}});
            navigate("SendBtcPage");
            
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 30,
              marginHorizontal: 20,
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../image/logo_btc.png")}
              style={{ width: 45, height: 45,  }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                BTC
              </Text>
              {/* <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                sdfewfwsf
              </Text> */}
            </View>

            <View style={{ flex: 1 }} />

            <View>
              <Text style={{ color: "#333", fontSize: 16,textAlign:'right' }}>{metaletWallet.currentBtcBalance} BTC </Text>
              <Text style={{ color: "#666", fontSize: 14 ,marginTop:10,textAlign:'right'}}>${(metaletWallet.currentBtcAssert)}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            navigate("SendSpacePage");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 30,
              marginHorizontal: 20,
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../image/logo_space.png")}
              style={{ width: 45, height: 45,  }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                SPACE
              </Text>

              <View
                style={{
                  marginTop: 3,
                  backgroundColor: "rgba(247, 147, 26, 0.2)",
                  borderRadius: 10,
                  alignItems: "center",
                  paddingVertical: 2,
                  paddingHorizontal:5
                }}
              >
                <Text style={{ fontSize: 8, color: "#FF981C" }}>
                  Bitcoin sidechain{" "}
                </Text>
              </View>
              {/* <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                sdfewfwsf
              </Text> */}
            </View>

            <View style={{ flex: 1 }} />

            <View>
              <Text style={{ color: "#333", fontSize: 16,textAlign:'right' }}>{metaletWallet.currentMvcBalance} SPACE </Text>
              <Text style={{ color: "#666", fontSize: 14 ,marginTop:10,textAlign:'right'}}>${(metaletWallet.currentSpaceAssert)}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>



        <TouchableWithoutFeedback
          onPress={() => {
            navigate("SendDogePage");
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 30,
              marginHorizontal: 20,
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../image/doge_logo.png")}
              style={{ width: 45, height: 45,  }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                SPACE
              </Text>

              <View
                style={{
                  marginTop: 3,
                  backgroundColor: "rgba(247, 147, 26, 0.2)",
                  borderRadius: 10,
                  alignItems: "center",
                  paddingVertical: 2,
                  paddingHorizontal:5
                }}
              >
                <Text style={{ fontSize: 8, color: "#FF981C" }}>
                  Bitcoin sidechain{" "}
                </Text>
              </View>
              {/* <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                sdfewfwsf
              </Text> */}
            </View>

            <View style={{ flex: 1 }} />

            <View>
              <Text style={{ color: "#333", fontSize: 16,textAlign:'right' }}>{metaletWallet.currentDogeBalance} DOGE </Text>
              <Text style={{ color: "#666", fontSize: 14 ,marginTop:10,textAlign:'right'}}>${(metaletWallet.currentDogeAssert)}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>


      </View>
    </SafeAreaView>
  );
}
