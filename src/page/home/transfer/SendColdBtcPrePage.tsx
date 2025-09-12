import { View, Text, Dimensions } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyQrCode, TitleBar } from "@/constant/Widget";
import { ActionType, MetaletColdRr } from "@/bean/MetaletColdRr";
import { metaStyles } from "@/constant/Constants";

export default function SendColdBtcPrePage({ route }) {
  const { result } = route.params;
  const { width } = Dimensions.get("window");

  let qrData = "1";
  console.log("result", result);
  const qrDataReady: MetaletColdRr = {
    name: result.chain == "btc" ? ActionType.SEND_BTC_UN_SIGN : ActionType.SEND_SPACE_UN_SIGN,
    hex: result.rawTx,
  };

  //   qrData = JSON.stringify(qrDataReady);
  qrData =
    "020000000001064303afd4837a212ac78f844bb994cb4e12a7a08ddb704b10dd30a8866f0ab8c70000000000ffffffffd6e2777f459020c5226f49807b19523bf75af7be8581c9fbe76072773bbe31380000000000ffffffff27142f1a389d2b3a5273afbb55b1c76f0ade19dd804a607bc03f5179aaf95ac80000000000ffffffffccba461e29100ada7a991987e62c07e6a6c879d95dbb3b3d5fbc538c3e351f3d0000000000ffffffff67578681a98791b9379fd6829123a00159011023afe8d993ea4a0986c98eb3db0000000000ffffffff40bb1d92db9ec6348cf2732b58ca02e173dffb6856309d8edc7d9bff70469f5e0000000000ffffffff06220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca220200000000000022512064729335d854ed8b52c83f02d7695630167de3f0bda3d511dfe881dd4d4aa4ca01401430b577ba20a852ed38d78ce98741d86c0662772f58e8da010b291e4165428a3825866b12d83c60767c8b7fbc6f170303727c07e2a48f52d8affa882a19389b0140f094159a76e9bbdaa78c9154a94ae0ade9243791fb7a57a3fe0bc9f7fbd6b6276c1a1fc44dbd47d06ca2fb606119dcbb606c46c760202c82b284d252f71003350140e9f6f6a1f975c683a7433236ac150957aead177a9aeb697309780199fa1a5044a6731dbe90251b019edd1b009ce671eb587689b2d43ec476d7e5745372edfc5a01407a79edc6444d8e6fb30ab65e88b3c51405709b4a7ab919faf81c540ab5cdd7916d38dd06d11ed1de975fb31d7d2c4624100e53f36ec0b72c747ffcde55d51d0201409404de3c3ff130d0c029ab184f9e555359567bed6b72fbd35fd82f8a1b8c6fabd9a7f9234009aa44200ea3f6850e9c5337e14d5261ac8b8d778f25fb4fb0fc09034031df8c3bb84a157422fdf91f78e9e17d44c6162c4645529a8eeb1ef6f1d066f506c646d55575281d8e79db12f0073937026b2762aa1643abf1737dd83dbc3bed9c208aaf64d3510d533338f1ab09bf3fe00adb42d4052035382b3de8a42092c79160ac0063066d6574616964066372656174650e2f66742f6d726332302f6d696e74013005312e302e30057574662d384b7b226964223a22386536353938393932373562316430366462383730666265653962323933626337336432356530363363633836383630613664353263316531313039316539626930227d6821c008839c624d3da34ae240086f60196409d619f285365cc3498fdd3a90b72599e400000000";
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <TitleBar title="Send" />
        <View style={{ flex: 1, margin: 20 }}>
          <View style={{ padding: 20 }}>
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
              <Text style={metaStyles.grayTextdefault66}>
                Scan with a cold wallet
              </Text>
              <View style={{ marginTop: 40 }}>
                <MyQrCode qrData={qrData} size={width - 50} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
