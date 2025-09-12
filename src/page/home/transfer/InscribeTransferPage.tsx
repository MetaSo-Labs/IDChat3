import {
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CustomTabBar,
  LoadingNoticeModal,
  RoundSimButton,
  TitleBar,
  VerifyModal,
} from "@/constant/Widget";
import {
  inputNormalBgColor,
  litterWhittleBgColor,
  metaStyles,
  themeColor,
} from "@/constant/Constants";
import {
  getWalletNetwork,
  parseToSat,
  parseToSpace,
} from "@/utils/WalletUtils";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as Clipboard from "expo-clipboard";
import { navigate } from "@/base/NavigationService";
import { fetchBrc20InscribeCommit } from "@/api/metaletservice";
import { useData } from "@/hooks/MyProvider";
import { InscribeResultData } from "@/api/type/Inscribe";
import { Chain } from "@metalet/utxo-wallet-service";
import { useTranslation } from "react-i18next";

const TabsTop = createMaterialTopTabNavigator();
export default function InscribeTransferPage({ route }) {
  const { transRes, amount, ticker, fileName, orderID } = route.params;
  const [isData, setIsData] = useState(true);
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [isShowVerify, setIsShowVerify] = useState(false);
  const [confirmDialogState, setConfirmDialogState] = useState(false);

  const { btcAddress, updateBtcAddress } = useData();
  const { t } = useTranslation();

  //   console.log("transRes", transRes);

  function showNotice(notice) {
    Clipboard.setString(notice);
    setNoticeContent("Copy Successful");
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 800);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />
      {/* pay verify modal */}
      <VerifyModal
        isShow={isShowVerify}
        eventCancel={() => {
          setIsShowVerify(false);
        }}
        event={async () => {
          setIsShowVerify(false);
          //   setConfirmDialogState(true);
          //   const { code, message, processingTime, data } = await broadcastBtc(
          //     transRes.rawTx
          //   );

          console.log(orderID, orderID);
          console.log(btcAddress, btcAddress);
          console.log("raxtx", transRes.rawTx);
          const network = await getWalletNetwork(Chain.BTC);

          const commitRes: InscribeResultData = await fetchBrc20InscribeCommit(
            0,
            orderID,
            btcAddress,
            network,
            transRes.rawTx
          );

          if (commitRes.code == 0) {
            console.log("commitRes", commitRes);
            setConfirmDialogState(true);
          } else {
            setNoticeContent(commitRes.message);
            setIsShowNotice(true);
            setTimeout(() => {
              setIsShowNotice(false);
            }, 1500);
          }
        }}
      />

      <Modal transparent={true} visible={confirmDialogState}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 40,
              paddingTop: 30,
              marginHorizontal: 30,
              alignItems: "center",
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}
            >
              Payment Sent
            </Text>

            <Image
              source={require("../../../../image/send_ok.png")}
              style={{ width: 150, height: 120, marginTop: 20 }}
            />

            <Text style={{ textAlign: "center", fontSize: 16, marginTop: 20 }}>
              Your transaction has been successfully sent
            </Text>

            <RoundSimButton
              title={"Confirm"}
              textColor="#fff"
              event={() => {
                setConfirmDialogState(false);
                navigate("InscribeSuccessPage", { fileName: fileName });
              }}
              roundStytle={{ marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>

      <View style={{ flex: 1 }}>
        {/* <TitleBar title="Inscribe Transfer" /> */}
        <TitleBar title="" />
        <View style={{ padding: 20, flex: 1 }}>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={[metaStyles.bigLargeDefaultText, { fontSize: 25 }]}>
              {amount} {ticker}
            </Text>
            <Text style={{ marginTop: 5, color: "#666", fontSize: 14 }}>
              {parseToSpace(transRes.fee)} BTC(network fee)
            </Text>
          </View>

          {/* choose Line */}
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setIsData(true);
              }}
            >
              <View>
                <Text
                  style={{ color: isData ? themeColor : "#333", fontSize: 16 }}
                >
                  Data
                </Text>
                {isData && (
                  <View
                    style={{
                      backgroundColor: themeColor,
                      width: 20,
                      height: 3,
                      marginTop: 10,
                      marginLeft: 5,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                setIsData(false);
              }}
            >
              <View style={{ marginLeft: 20 }}>
                <Text
                  style={{ color: !isData ? themeColor : "#333", fontSize: 16 }}
                >
                  Hex
                </Text>
                {!isData && (
                  <View
                    style={{
                      backgroundColor: themeColor,
                      width: 20,
                      height: 3,
                      marginTop: 10,
                      marginLeft: 5,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>

            <View
              style={{
                backgroundColor: inputNormalBgColor,
                width: "100%",
                height: 0.5,
                position: "absolute",
                bottom: 0,
                marginLeft: 5,
              }}
            />
          </View>

          {isData && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: "#666", fontSize: 16 }}>Inputs</Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  backgroundColor: litterWhittleBgColor,
                  padding: 10,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{ color: "#333", fontSize: 14, width: 130 }}
                >
                  {transRes.txInputs[0].address}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {parseToSpace(transRes.txInputs[0].value)} BTC
                </Text>
              </View>

              {transRes.txInputs.length > 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 20,
                    backgroundColor: litterWhittleBgColor,
                    padding: 10,
                    paddingVertical: 15,
                    borderRadius: 10,
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={{ color: "#333", fontSize: 14, width: 130 }}
                  >
                    {transRes.txInputs[1].address}
                  </Text>
                  <Text style={{ color: "#333", fontSize: 14 }}>
                    {parseToSpace(transRes.txInputs[1].value)} BTC
                  </Text>
                </View>
              )}

              <Text style={{ color: "#666", fontSize: 16, marginTop: 30 }}>
                Outputs
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  backgroundColor: litterWhittleBgColor,
                  padding: 10,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{ color: "#333", fontSize: 14, width: 130 }}
                >
                  {transRes.txOutputs[0].address}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {parseToSpace(transRes.txOutputs[0].value)} BTC
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  backgroundColor: litterWhittleBgColor,
                  padding: 10,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{ color: "#333", fontSize: 14, width: 130 }}
                >
                  {transRes.txOutputs[1].address}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {parseToSpace(transRes.txOutputs[1].value)} BTC
                </Text>
              </View>

              <Text style={{ color: "#666", fontSize: 16, marginTop: 30 }}>
                Network Fee
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  backgroundColor: litterWhittleBgColor,
                  padding: 10,
                  paddingVertical: 15,
                  borderRadius: 10,
                  justifyContent: "space-between",
                }}
              >
                {/* <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{ color: "#333", fontSize: 14, width: 130 }}
                >
                  {transRes.txInputs[0].address}
                </Text> */}
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {parseToSpace(transRes.fee)} BTC
                </Text>
              </View>
            </View>
          )}

          {!isData && (
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#666", fontSize: 16, marginTop: 20 }}>
                Outputs
              </Text>

              <ScrollView style={{ flex: 1, maxHeight: "45%" }}>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 10,
                    backgroundColor: litterWhittleBgColor,
                    padding: 10,
                    borderRadius: 10,
                    justifyContent: "space-between",
                  }}
                >
                  <Text ellipsizeMode="tail" style={{}}>
                    {transRes.rawTx}
                  </Text>
                </View>
              </ScrollView>

              <TouchableWithoutFeedback
                onPress={() => {
                  showNotice(transRes.rawTx);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <Text>Copy psbt transaction data </Text>
                  <Image
                    source={require("../../../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20 }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}

          <RoundSimButton
            title={t("c_confirm")}
            textColor="#fff"
            roundStytle={{
              position: "absolute",
              bottom: 20,
              marginLeft: 20,
              marginRight: 20,
            }}
            event={() => {
              setIsShowVerify(true);
              //   navigate("InscribeSuccessPage");
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// <TabsTop.Navigator
//             initialRouteName="DataView"
//             tabBarPosition="top"
//             style={{ marginTop: 10 }}
//             screenOptions={{
//               tabBarLabelStyle: {
//                 fontSize: 15,
//                 fontWeight: "bold",
//                 textTransform: "none",
//               },
//               tabBarInactiveTintColor: "#333",
//               tabBarActiveTintColor: "#1F2CFF",
//               tabBarStyle: {
//                 backgroundColor: "#fff",
//                 height: 50,
//                 elevation: 0,
//               },
//               tabBarIndicatorStyle: {
//                 backgroundColor: "#1F2CFF",
//                 height: 3,
//                 width: 20,
//                 marginLeft: 20,
//               },
//               tabBarItemStyle: { height: 50, width: 70 }, //每个item 宽度
//             }}
//           >
//             <TabsTop.Screen
//               name="DataView"
//               options={{ title: "Data" }}
//               component={DataView}
//             />
//             <TabsTop.Screen
//               name="HexView"
//               options={{ title: "Hex" }}
//               component={HexView}
//             />
//           </TabsTop.Navigator>
