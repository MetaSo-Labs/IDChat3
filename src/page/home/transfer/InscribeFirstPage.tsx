import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Line, RoundSimButton, TitleBar } from "@/constant/Widget";
import {
  inputNormalBgColor,
  metaStyles,
  themeColor,
} from "@/constant/Constants";
import { FeedBean, FeedBtcObject } from "@/types/btcfeed";
import { fetchBrc20InscribePre, fetchBtcFeed } from "@/api/metaletservice";
import { useData } from "@/hooks/MyProvider";
import { PreInscribe, PreInscribeData } from "@/api/type/Inscribe";
import { navigate } from "@/base/NavigationService";
import { getWalletNetwork } from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";
import { useTranslation } from "react-i18next";

export default function InscribeFirstPage({ route }) {
  const { brc20 } = route.params;
  const [inputAmount, setInputAmount] = useState("0");

  //wallet
  const { btcAddress, updateBtcAddress } = useData();

  //feed
  const [isShowFeed, setIsShowFeed] = useState(false);
  const feedModeSlow = "Slow";
  const feedModeAvg = "Avg";
  const feedModeFast = "Fast";
  const feedModeCustom = "Custom";
  const [feedModeType, setFeedModeType] = useState(feedModeAvg);
  const textInputRef = useRef(null);
  const [feed, setFeed] = useState("10");
  const [feedReady, setFeedReady] = useState("10");
  const { t } = useTranslation();

  const [userSlowFeed, setSlowFeed] = useState<FeedBean>({
    title: "",
    feeRate: 10,
    desc: "",
  });
  const [userAvgFeed, setAvgFeed] = useState<FeedBean>({
    title: "",
    feeRate: 10,
    desc: "",
  });
  const [userFastFeed, setFastFeed] = useState<FeedBean>({
    title: "",
    feeRate: 10,
    desc: "",
  });

  useEffect(() => {
    getFeed();
  }, []);

  async function getFeed() {
    const feedObj: FeedBtcObject = await fetchBtcFeed();

    if (feedObj) {
      let feedList = feedObj.data.list;
      setSlowFeed(feedList[2]);
      setAvgFeed(feedList[1]);
      setFastFeed(feedList[0]);
      setFeed(feedList[1].feeRate.toString());
      setFeedReady(feedList[1].feeRate.toString());
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log("click");
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <Modal transparent={true} visible={isShowFeed}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingBottom: 40,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Select Fee Rate
                </Text>

                <View style={{ flex: 1 }} />

                <TouchableWithoutFeedback
                  onPress={() => {
                    setIsShowFeed(false);
                  }}
                >
                  <Image
                    source={require("../../../../image/metalet_close_big_icon.png")}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 20,
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeSlow);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userSlowFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor:
                        feedModeType == feedModeSlow
                          ? themeColor
                          : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                    }}
                  >
                    {feedModeType == feedModeSlow && (
                      <Image
                        source={require("../../../../image/fee_icon_tag.png")}
                        style={{
                          width: 13,
                          height: 13,
                          position: "absolute",
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#333" }}>
                        {userSlowFeed.title}
                      </Text>
                      <Text style={{ marginTop: 3, color: "#000" }}>
                        {userSlowFeed.feeRate} sat/vB
                      </Text>
                      <Text
                        style={{ color: "#666", fontSize: 12, marginTop: 3 }}
                      >
                        {userSlowFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeAvg);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userAvgFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor:
                        feedModeType == feedModeAvg
                          ? themeColor
                          : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                      marginLeft: 10,
                    }}
                  >
                    {feedModeType == feedModeAvg && (
                      <Image
                        source={require("../../../../image/fee_icon_tag.png")}
                        style={{
                          width: 13,
                          height: 13,
                          position: "absolute",
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#333" }}>{userAvgFeed.title}</Text>
                      <Text style={{ marginTop: 3, color: "#000" }}>
                        {userAvgFeed.feeRate} sat/vB
                      </Text>
                      <Text
                        style={{ color: "#666", fontSize: 12, marginTop: 3 }}
                      >
                        {userAvgFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeFast);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userFastFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor:
                        feedModeType == feedModeFast
                          ? themeColor
                          : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                      marginLeft: 10,
                    }}
                  >
                    {feedModeType == feedModeFast && (
                      <Image
                        source={require("../../../../image/fee_icon_tag.png")}
                        style={{
                          width: 13,
                          height: 13,
                          position: "absolute",
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#333" }}>
                        {userFastFeed.title}
                      </Text>
                      <Text style={{ marginTop: 3, color: "#000" }}>
                        {userFastFeed.feeRate} sat/vB
                      </Text>
                      <Text
                        style={{ color: "#666", fontSize: 12, marginTop: 3 }}
                      >
                        {userFastFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>

              <TouchableWithoutFeedback
                onPress={() => {
                  setFeedModeType(feedModeCustom);
                }}
              >
                <View
                  style={{
                    borderColor:
                      feedModeType == feedModeCustom
                        ? themeColor
                        : inputNormalBgColor,
                    borderWidth: 1,
                    borderRadius: 5,
                    marginTop: 20,
                    height: "auto",
                  }}
                >
                  {feedModeType == feedModeCustom && (
                    <Image
                      source={require("../../../../image/fee_icon_tag.png")}
                      style={{
                        width: 13,
                        height: 13,
                        position: "absolute",
                        right: 0,
                      }}
                    />
                  )}
                  <View
                    style={{
                      justifyContent: "center",
                      padding: 10,
                    }}
                  >
                    <Text>Custom Fee Rate</Text>

                    <TextInput
                      placeholder="sat/vB"
                      ref={textInputRef}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        if (feedModeType == feedModeCustom) {
                          // const numericInput = text.replace(/[^0-9]/g, '');
                          setFeedReady(text);
                          // setFeed(parseInt(numericInput));
                        }
                      }}
                      style={{
                        width: "100%",
                        backgroundColor: "transparent",
                      }}
                      onFocus={() => {
                        setFeedModeType(feedModeCustom);
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback
                onPress={async () => {
                  setFeed(feedReady);
                  setIsShowFeed(false);
                }}
              >
                <View
                  style={{
                    marginTop: 20,
                    marginBottom: 20,
                    height: 20,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={[
                      {
                        flexDirection: "row",
                        height: 48,
                        width: "70%",
                        backgroundColor: themeColor,
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        { textAlign: "center" },
                        { color: "#fff" },
                        { fontSize: 16 },
                      ]}
                    >
                      Confirm
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>

        <View style={{ flex: 1 }}>
          {/* <TitleBar title={"Inscribe Transfer"} /> */}
          <TitleBar title={t("b_inscribe_transfer")} />

          <View style={{ padding: 20 }}>
            <View
              style={{
                marginTop: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  paddingTop: 10,
                  width: 150,
                  height: 150,
                  marginBottom: 20,
                  alignItems: "center",
                  backgroundColor: "#F5F7F9",
                  borderRadius: 10,
                }}
              >
                <Text style={[metaStyles.grayTextSmall66, { marginTop: 15 }]}>
                  {brc20.ticker}
                </Text>

                <Text
                  style={[metaStyles.largeDefaultLittleText, { marginTop: 10 }]}
                >
                  {inputAmount}
                </Text>

                <View
                  style={{
                    backgroundColor: themeColor,
                    width: "100%",
                    borderBottomEndRadius: 10,
                    borderBottomStartRadius: 10,
                    alignItems: "center",
                    paddingVertical: 8,
                    marginTop: 10,
                    position: "absolute",
                    bottom: 0,
                  }}
                >
                  <Text style={{ color: "#fff" }}>Transfer</Text>
                </View>
              </View>
            </View>

            <Line top={20} />

            <Text style={{ textAlign: "right", marginTop: 20, color: "#999" }}>
              {t("b_available")} {brc20.availableBalanceSafe} {brc20.ticker}
            </Text>

            <View
              style={{
                alignItems: "center",
                borderColor: "rgba(191, 194, 204, 0.5)",
                flexDirection: "row",
                borderWidth: 1,
                height: 50,
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <TextInput
                placeholder={t("c_amount")}
                inputMode="numeric"
                onChangeText={(text) => {
                  setInputAmount(text);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  marginLeft: 10,
                  paddingRight: 10,
                }}
              />
            </View>

            <TouchableWithoutFeedback
              onPress={() => {
                setIsShowFeed(true);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 30,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {t("c_fee_rate")}
                </Text>
                <View style={{ flex: 1 }} />
                <Text style={{ color: "#999", fontSize: 14 }}>
                  {feed} sat/vB
                </Text>
                <Image
                  source={require("../../../../image/list_icon_ins.png")}
                  style={{ width: 18, height: 18 }}
                />
              </View>
            </TouchableWithoutFeedback>

            <RoundSimButton
              title={t("c_next")}
              color={themeColor}
              textColor={"#fff"}
              roundStytle={{ marginTop: 100 }}
              event={() => {
                inscribePre();
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );

  async function inscribePre() {
    // console.log("inscribePre");
    // console.log(feed)
    // console.log(btcAddress);
    // console.log(inputAmount)
    const fileName = `{"p":"brc-20","op":"transfer","tick":"${brc20.ticker}","amt":"${inputAmount}"}`;
    console.log(JSON.stringify(fileName));

    if (parseFloat(inputAmount) <= 0) {
      return;
    }
    if (!btcAddress) {
      return;
    }
    // const base64Data= Buffer.from(fileName).toString("base64");
    // console.log(base64Data);
    const network = await getWalletNetwork(Chain.BTC);

    const preInscribe: PreInscribeData = await fetchBrc20InscribePre(
      btcAddress,
      parseInt(feed),
      network,
      fileName
    );

    // console.log(JSON.stringify(preInscribe));
    navigate("InscribePrePage", {
      inscribePre: preInscribe.data,
      brc20: brc20,
      amount: inputAmount,
      fileName: fileName,
    });
  }
}
