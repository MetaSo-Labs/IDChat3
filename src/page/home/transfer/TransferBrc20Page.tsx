import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CircleAvatar,
  CircleAvatarLetter,
  LoadingModal,
  LoadingNoticeModal,
  QRScanner,
  RoundSimButton,
  RoundSimButtonFlee,
  TitleBar,
  VerifyModal,
} from "@/constant/Widget";
import { FeedBean, FeedBtcObject } from "@/types/btcfeed";
import { useData } from "@/hooks/MyProvider";
import { inputNormalBgColor, themeColor } from "@/constant/Constants";
import { getBtcBrc20Icon } from "@/utils/AssertUtils";
import { navigate } from "@/base/NavigationService";
import { ScriptType, SignType } from "@metalet/utxo-wallet-service";
import { getBtcUtxos, getInscriptionUtxo } from "@/queries/utxos";
import { broadcastBtc, fetchBtcFeed } from "@/api/metaletservice";
import { getRandomID, parseToSpace } from "@/utils/WalletUtils";
import { addMetaletSafeUtxo } from "@/wallet/wallet";
import { useTranslation } from "react-i18next";

export default function TransferBrc20Page({ route }) {
  const [isShowFeed, setIsShowFeed] = useState(false);
  const feedModeSlow = "Slow";
  const feedModeAvg = "Avg";
  const feedModeFast = "Fast";
  const feedModeCustom = "Custom";
  const [feedModeType, setFeedModeType] = useState(feedModeAvg);
  const textInputRef = useRef(null);
  const [feed, setFeed] = useState("10");
  const [feedReady, setFeedReady] = useState("10");

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

  //wallet
  const { metaletWallet, updateMetaletWallet } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [confirmDailogState, setConfirmDailogState] = useState(false);
  const { needRefreshHome, updateNeedRefreshHome } = useData();

  const [isShowVerify, setIsShowVerify] = useState(false);
  const [isScan, setIsScan] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [nextBtnColor, setNextBtnColor] = useState("rgba(23, 26, 255, 0.5)");
  const [isErrorIcon, setisErrorIcon] = useState(false);
  // commfirn
  const [fee, setfee] = useState("");
  const [total, settotal] = useState("");
  const [rawTx, setRawTx] = useState<string>();
  const { t } = useTranslation();

  const { tokenTransfer } = route.params;
  let ImageUrl = getBtcBrc20Icon(tokenTransfer.ticker);
  if (!ImageUrl) {
    ImageUrl = "1";
  }

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

  async function sendBRC20() {
    try {
      const needRawTx =
        metaletWallet.currentBtcWallet.getScriptType() === ScriptType.P2PKH;
      const utxo = await getInscriptionUtxo(
        tokenTransfer.inscriptionId,
        needRawTx
      );
      const utxos = await getBtcUtxos(btcAddress, needRawTx);
      // const { fee, rawTx, cost } = metaletWallet.currentBtcWallet.sendBRC20(
      //   inputAddress,
      //   [utxo],
      //   parseFloat(feed),
      //   utxos
      // );

      const { fee, rawTx: _rawTx } = metaletWallet.currentBtcWallet!.signTx(
        SignType.Transfer,
        {
          recipient: inputAddress,
          transferUTXOs: [utxo],
          feeRate: parseFloat(feed)!,
          utxos,
        }
      );

      if (_rawTx) {
        console.log("rawTx", _rawTx);
        setfee(parseToSpace(fee.toString()));
        //TODO
        // settotal(parseToSpace(cost.toString()));
        setRawTx(_rawTx);
        setConfirmDailogState(true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log("click");
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingModal
          isShow={isShowLoading}
          isCancel={true}
          event={() => {
            setIsShowLoading(false);
          }}
        />

        <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

        {/* feed */}
        <Modal transparent={true} visible={isShowFeed}>
          <View
            style={{
              flex: 1,
              justifyContent: Platform.OS === "ios" ? "center" : "flex-end",
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
                borderBottomLeftRadius: Platform.OS === "ios" ? 10 : 0,
                borderBottomRightRadius: Platform.OS === "ios" ? 10 : 0,
                marginHorizontal: Platform.OS === "ios" ? 10 : 0,
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
                        style={{ color: "#666", fontSize: 10, marginTop: 3 }}
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
                        style={{ color: "#666", fontSize: 10, marginTop: 3 }}
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
                        style={{ color: "#666", fontSize: 10, marginTop: 3 }}
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
                      keyboardType={
                        Platform.OS === "ios" ? undefined : "numeric"
                      }
                      value={feedReady}
                      onChangeText={(text) => {
                        if (feedModeType == feedModeCustom) {
                          const numericInput = text.replace(/[^0-9]/g, "");
                          setFeedReady(numericInput);
                          // setFeed(parseInt(numericInput));
                          // if(Platform.OS === "ios" ){
                          //   Keyboard.dismiss();
                          // }
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

        {/* pay comfirm */}
        <Modal visible={confirmDailogState} transparent={true}>
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
                paddingHorizontal: 30,
                paddingTop: 30,
                marginHorizontal: 20,
              }}
            >
              {/* <Text style={{ textAlign: "center", fontSize: 16 }}>
              Confirm Transaction
            </Text> */}

              {/* 头部 */}
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isErrorIcon ? (
                  <CircleAvatarLetter
                    widthC={60}
                    heightC={60}
                    letterStr={tokenTransfer.ticker.substring(0, 1)}
                  />
                ) : (
                  <CircleAvatar
                    imageUrl={ImageUrl}
                    event={() => {
                      setisErrorIcon(true);
                      // refreshData(brc20.txid);
                    }}
                  />
                )}

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
                  {tokenTransfer.ticker.toUpperCase()}
                </Text>
              </View>

              <View>
                <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
                  {t("c_from")}
                </Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {metaletWallet.currentBtcWallet.getAddress()}
                </Text>
              </View>

              <View>
                <Text style={{ marginTop: 10, color: "#666", fontSize: 14 }}>
                {t("c_to")}
                </Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {inputAddress}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#666", fontSize: 14 }}>{t("c_amount")}</Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {tokenTransfer.amount} {tokenTransfer.ticker}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#666", fontSize: 14 }}>
                {t("c_fees")}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{fee} BTC</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#666", fontSize: 14 }}>{t("c_total")}</Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{total} BTC</Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  justifyContent: "space-between",
                }}
              >
                <RoundSimButtonFlee
                  title={t("c_cancel")}
                  style={{
                    borderRadius: 10,
                    height: 40,
                    width: "45%",
                    borderWidth: 1,
                    borderColor: themeColor,
                  }}
                  color="#fff"
                  textColor="#171AFF"
                  event={() => {
                    setConfirmDailogState(false);
                  }}
                />

                <RoundSimButtonFlee
                  title={t("c_confirm")}
                  style={{ borderRadius: 10, height: 40, width: "45%" }}
                  textColor="#fff"
                  event={() => {
                    setConfirmDailogState(false);
                    setIsShowVerify(true);
                    // OpenModal();
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* pay verify modal */}
        <VerifyModal
          isShow={isShowVerify}
          eventCancel={() => {
            setIsShowVerify(false);
          }}
          event={async () => {
            setIsShowVerify(false);
            console.log("receiver", inputAddress);
            console.log("amount", tokenTransfer.amount);
            console.log("ticker", tokenTransfer.ticker);

            //   navigate("SendSuccessPage", {
            //     result: {
            //       address: inputAddress,
            //       txid: "data",
            //       chain: "btc",
            //       amount: tokenTransfer.amount,
            //       symbol: tokenTransfer.ticker,
            //     },
            //   });

            //   broadcast
            const { code, message, processingTime, data } =
              await broadcastBtc(rawTx);
            if (data) {
              setIsShowLoading(false);
              updateNeedRefreshHome(getRandomID());
              navigate("SendSuccessPage", {
                result: {
                  address: inputAddress,
                  txid: data,
                  chain: "btc",
                  amount: tokenTransfer.amount,
                  symbol: tokenTransfer.ticker,
                },
              });

              addMetaletSafeUtxo(rawTx, data);
            }
          }}
        />

        {isScan ? (
          <QRScanner
            handleScan={(data) => {
              setInputAddress("");
              setInputAddress(data);
              setIsScan(false);
            }}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <TitleBar />
            <View
              style={{
                justifyContent: "center",
                // backgroundColor: "#fff",
                margin: 20,
                // borderRadius: 10,
                alignItems: "center",
                padding: 20,
              }}
            >
              {isErrorIcon ? (
                <CircleAvatarLetter
                  widthC={60}
                  heightC={60}
                  letterStr={tokenTransfer.ticker.substring(0, 1)}
                />
              ) : (
                <CircleAvatar
                  imageUrl={ImageUrl}
                  event={() => {
                    setisErrorIcon(true);
                    // refreshData(brc20.txid);
                  }}
                />
              )}

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
                {tokenTransfer.ticker.toUpperCase()}
              </Text>

              <Text
                style={{
                  color: "#666",
                  textAlign: "center",
                  lineHeight: 20,
                  marginTop: 5,
                  fontSize: 14,
                }}
              >
                BRC-20
              </Text>

              <View
                style={{
                  borderColor: "rgba(191, 194, 204, 0.5)",
                  flexDirection: "row",
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  marginTop: 50,
                  alignItems: "center",
                }}
              >
                <TextInput
                  placeholder={t("c_receive_address")}
                  value={inputAddress}
                  onChangeText={(text) => {
                    setInputAddress(text);
                    if (text.length > 0) {
                      setNextBtnColor("rgba(23, 26, 255, 1)");
                    } else {
                      setNextBtnColor("rgba(23, 26, 255, 0.5)");
                    }
                  }}
                  onFocus={() => {
                    // setIsInputAddressFcous(true);
                    // setIsInputAmountFcous(false);
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    marginLeft: 10,
                    flex: 1,
                    // textAlignVertical: "left",
                    paddingRight: 10,
                  }}
                />

                {/* <View style={{ position: "absolute", right: 0 ,bottom: 10,}}> */}
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (isScan == false) {
                      console.log("scan");
                      setIsScan(true);
                    }
                  }}
                >
                  <Image
                    source={require("../../../../image/send_scan_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
                {/* </View> */}
              </View>

              <View style={{ width: "100%", marginTop: 20 }}>
                <Text>{t("c_amount")}</Text>
              </View>

              <View
                style={{
                  alignItems: "center",
                  borderColor: "rgba(191, 194, 204, 0.5)",
                  flexDirection: "row",
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  marginTop: 10,
                  width: "100%",
                }}
              >
                <Text style={{ marginLeft: 5, marginRight: 10 }}>
                  {tokenTransfer.amount}
                </Text>

                <Text style={{ marginRight: 10, fontSize: 14, color: "#333" }}>
                  {tokenTransfer.ticker.toUpperCase()}
                </Text>
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
                  <Text style={{ color: "#666", fontSize: 14 }}>{t("c_fee_rate")}</Text>
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

              <View
                style={{
                  marginTop: 90,
                  width: "100%",
                }}
              >
                <RoundSimButton
                  title={t("c_next")}
                  event={() => {
                    sendBRC20();
                  }}
                  textColor="#fff"
                  color={nextBtnColor}
                />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
