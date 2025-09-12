import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  ToastView,
  VerifyModal,
  styles,
} from "../../constant/Widget";
import {
  grayNormalColor,
  inputNormalBgColor,
  metaStyles,
  themeColor,
} from "../../constant/Constants";
import { FeedBean, FeedBtcObject } from "../../types/btcfeed";
import {
  broadcastBtc,
  fetchBtcBalance,
  fetchBtcFeed,
} from "../../api/metaletservice";
import { Data, RootBtcBalanceObject } from "../../bean/BtcBalanceBean";
import { useData } from "../../hooks/MyProvider";
import { Utxo, UtxoBean } from "../../types/utxoBean";
import {
  AddressType,
  Chain,
  ScriptType,
  SignType,
} from "@metalet/utxo-wallet-service";
import { getBtcUtxos, getMRC20Utxos } from "../../queries/utxos";
import { broadcastBTCTx } from "../../queries/transaction";
import { navigate } from "../../base/NavigationService";
import { addMetaletSafeUtxo, getCurrentBtcWallet } from "../../wallet/wallet";
import {
  getRandomID,
  getWalletNetwork,
  parseToSat,
  parseToSpace,
} from "../../utils/WalletUtils";
import { wallet_mode_cold } from "@/utils/AsyncStorageUtil";
import { getNetwork } from "@/lib/network";
import useNetworkStore from "@/stores/useNetworkStore";
import { useTranslation } from "react-i18next";

export default function SendMrc20Page({ route }) {
  const { mrc20Data } = route.params;

  const [nextBtnColor, setNextBtnColor] = useState("rgba(23, 26, 255, 0.5)");
  const [inputAddress, setInputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [isInputAddressFcous, setIsInputAddressFcous] = useState(false);
  const [isInputAmountFcous, setIsInputAmountFcous] = useState(false);

  // 扫描
  const [isScan, setIsScan] = useState(false);
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

  const { t } = useTranslation();

  //wallet
  const { metaletWallet, updateMetaletWallet } = useData();
  const { btcAddress, updateBtcAddress } = useData();
  const [btcBalance, setBtcBalance] = useState<Data>({
    balance: 0.00000546,
    block: {
      incomeFee: 0.00581438,
      spendFee: 0.00580892,
    },
    mempool: {
      incomeFee: 0,
      spendFee: 0,
    },
    pendingBalance: 0,
    safeBalance: 0.00000546,
    inscriptionsBalance: 0,
    runesBalance: 0,
    pinsBalance: 0,
  });
  const [utxoList, setUtxos] = useState<Utxo[]>([]);
  // const { metaletWallet, updateMetaletWallet } = useData();

  //提示
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [confirmDailogState, setConfirmDailogState] = useState(false);
  const { needRefreshHome, updateNeedRefreshHome } = useData();

  // verfiy
  const [isShowVerify, setIsShowVerify] = useState(false);

  // commfirn
  const [fee, setfee] = useState("");
  const [total, settotal] = useState("");
  const [rawTx, setRawTx] = useState<string>();
  const [revealTx, setRevealTx] = useState<string>();

  const [aboutFee, setAboutFee] = useState(3000);
  const { walletMode, updateWalletMode } = useData();
  // const { netWork, updateNetWork } = useData();
  const { network, switchNetwork } = useNetworkStore();

  useEffect(() => {
    getFeed();
    getBtcBalance();
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

  async function getBtcBalance() {
    const balance: RootBtcBalanceObject = await fetchBtcBalance(btcAddress);
    setBtcBalance(balance.data);
  }

  async function sendBtc() {
    const btcWallet = await getCurrentBtcWallet();
    const needRawTx = btcWallet.getScriptType() === ScriptType.P2PKH;
    const utxos = await getBtcUtxos(btcAddress, needRawTx);

    console.log("needRawTx", needRawTx);

    console.log("交易参数 inputAddress:" + inputAddress);
    console.log("交易参数 inputAmount:" + inputAmount);
    console.log("交易参数 feed:" + feed);
    console.log("交易参数 utxos:" + JSON.stringify(utxos));
    console.log("当前钱包地址：" + btcWallet.getAddress());

    const network = await getWalletNetwork(Chain.BTC);

    try {
      // const { rawTx, cost } = btcWallet.send(
      //   inputAddress,
      //   inputAmount,
      //   parseInt(feed),
      //   utxos
      // );
      const mrc20Utxos = await getMRC20Utxos(
        btcAddress,
        mrc20Data!.mrc20Id,
        needRawTx
      );

      console.log("feed", feed);

      const { commitTx, revealTx } = btcWallet.signTx(SignType.MRC20_TRANSFER, {
        utxos,
        flag: "metaid",
        amount: inputAmount,
        // metaIdPinUtxos,
        commitFeeRate: parseInt(feed),
        revealFeeRate: parseInt(feed),
        mrc20Utxos,
        body: JSON.stringify([
          {
            vout: 1,
            id: mrc20Data.mrc20Id,
            amount: inputAmount,
          },
        ]),
        revealAddr: inputAddress,
      });

      console.log("commitTx:", commitTx);
      console.log("revealTx:", revealTx);

      const fee1 = parseFloat(commitTx.fee);
      const fee2 = parseFloat(revealTx.fee);
      const fee = fee1 + fee2;
      const totalFee = parseToSpace(fee.toString()).toString();
      setfee(totalFee);
      setRawTx(commitTx.rawTx);
      setRevealTx(revealTx.rawTx);

      // const amount = parseToSat(inputAmount);
      // const gas = parseInt(cost) - amount;
      // const fee = parseToSpace(gas.toString()).toString();
      // const total = parseToSpace(cost.toString()).toString();
      // settotal(total);
      // setfee(fee);

      // console.log(rawTx);
      // console.log(cost);

      // setRawTx(rawTx);

      setConfirmDailogState(true);
    } catch (e) {
      console.log("send error", e);
      ToastView({ text: e.toString(), type: "error" });
    }

    // const txId = await broadcastBTCTx(rawTx).catch((err) => {
    //   console.log(err);
    // });
  }

  async function sendColdBtc() {
    console.log("send cold btc");
    try {
      const { rawTx, cost } = { rawTx: "rawTx_data", cost: "3200" };
      settotal("42000");
      setfee("3200");
      setRawTx(rawTx);
      setConfirmDailogState(true);
    } catch (e) {
      console.log(e);
    }
  }

  async function sendColdBtcConfirm() {
    navigate("SendColdBtcPrePage", {
      result: {
        chain: "btc",
        rawTx: rawTx,
      },
    });
  }

  const OpenModal = async () => {
    setIsShowLoading(true);

    // broadcast
    const result = await broadcastBtc(rawTx);
    const { code, message, processingTime, data } =
      await broadcastBtc(revealTx);
    if (data) {
      setIsShowLoading(false);
      updateNeedRefreshHome(getRandomID());
      navigate("SendSuccessNormalPage", {
        result: {
          txid: data,
          chain: "btc",
          symbol: mrc20Data.tick.toUpperCase(),
          amount: inputAmount,
          address: inputAddress,
        },
      });
      addMetaletSafeUtxo(rawTx, data);
    }

    // setTimeout(() => {
    //   setIsShowLoading(false);
    //   // navigate("HomePage");
    //   navigate("SendBtcSuccessPage");
    // }, 2000);
  };

  const metaData = mrc20Data.metaData;
  let mrc20Img = "";
  if (
    metaData &&
    metaData != null &&
    metaData != undefined &&
    metaData != "" &&
    metaData != "undefined" &&
    JSON.stringify(metaData).includes("icon")
  ) {
    const metaDataObject = JSON.parse(metaData);

    const startIndex = metaData.indexOf("metafile://") + "metafile://".length;
    const endIndex = metaData.indexOf('"', startIndex);
    const extractedString = metaData.substring(startIndex, endIndex);

    if (network === "mainnet") {
      if (metaDataObject.icon.startsWith("http")) {
        mrc20Img = metaDataObject.icon;
      } else {
        mrc20Img = "https://man.metaid.io/content/" + extractedString;
      }
    } else {
      if (metaDataObject.icon.startsWith("http")) {
        mrc20Img = metaDataObject.icon;
      } else {
        mrc20Img = "https://man-test.metaid.io/content/" + extractedString;
      }
    }
  }

  if (mrc20Data.tag) {
    if (mrc20Data.tag.trim() == "id-coins") {
      if (
        mrc20Data.deployUserInfo.avatar &&
        mrc20Data.deployUserInfo.avatar.trim() != ""
      ) {
        mrc20Img = mrc20Data.deployUserInfo.avatar;
      } else {
        mrc20Img = "";
      }
    }
  }
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingModal
          isShow={isShowLoading}
          isCancel={true}
          event={() => {
            setIsShowLoading(false);
          }}
        />

        <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

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
                {/* <Image
                source={require("../../../image/receive_btc_icon.png")}
                style={{ width: 50, height: 50 }}
              /> */}

                <CircleAvatarLetter
                  letterStr={mrc20Data.tokenName.substring(0, 1)}
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
                  {inputAmount} {mrc20Data.tick}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    marginTop: 15,
                    color: grayNormalColor,
                    fontSize: 14,
                  }}
                >
                  {t("c_from")}
                </Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {/* {metaletWallet.currentBtcWallet.getAddress()} */}
                  {btcAddress}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    marginTop: 10,
                    color: grayNormalColor,
                    fontSize: 14,
                  }}
                >
                  {t("c_from")}
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
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                  {t("c_amount")}
                </Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {/* {parseFloat(inputAmount).toFixed(8)} */}
                  {inputAmount}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                  {t("c_fees")}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{fee} BTC</Text>
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
                    source={require("../../../image/metalet_close_big_icon.png")}
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
                        source={require("../../../image/fee_icon_tag.png")}
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
                        source={require("../../../image/fee_icon_tag.png")}
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
                        source={require("../../../image/fee_icon_tag.png")}
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
                      source={require("../../../image/fee_icon_tag.png")}
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
                      onChangeText={(text) => {
                        if (feedModeType == feedModeCustom) {
                          const numericInput = text.replace(/[^0-9]/g, "");
                          setFeedReady(numericInput);
                          // if (Platform.OS === "ios") {
                          //   Keyboard.dismiss();
                          // }
                        }
                      }}
                      value={feedReady}
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

        {/* pay verify modal */}
        <VerifyModal
          isShow={isShowVerify}
          eventCancel={() => {
            setIsShowVerify(false);
          }}
          event={() => {
            setIsShowVerify(false);

            console.log("确认");

            if (walletMode === wallet_mode_cold) {
              sendColdBtcConfirm();
            } else {
              OpenModal();
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
            {/* title="Send MRC20" */}
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
              {/* <Image
              source={require("../../../image/receive_btc_icon.png")}
              style={{ width: 70, height: 70 }}
            /> */}

              {/* <CircleAvatarLetter
              letterStr={mrc20Data.tokenName.substring(0, 1)}
              widthC={70}
              heightC={70}
            /> */}

              {mrc20Img != null && mrc20Img != "" ? (
                <CircleAvatar
                  imageUrl={mrc20Img}
                  event={() => {
                    // refreshData(item.name);
                  }}
                  widthC={65}
                  heightC={65}
                />
              ) : (
                <CircleAvatarLetter
                  letterStr={mrc20Data.tokenName.substring(0, 1)}
                  widthC={70}
                  heightC={70}
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
                {mrc20Data.tokenName}
              </Text>

              <View
                style={{
                  borderColor: isInputAddressFcous
                    ? themeColor
                    : "rgba(191, 194, 204, 0.5)",
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
                    setInputAddress(text.trim());
                    if (text.length > 0 && inputAmount.length > 0) {
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
                    source={require("../../../image/send_scan_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
                {/* </View> */}
              </View>

              {/* 
       <View style={{flexDirection: "row", marginTop: 20,}}>
       <Text style={{ marginTop: 20, color: "#666", fontSize: 14 ,width:'100%',textAlign:'right'}}> Balance: 0.003234 SPACE</Text>
       </View> */}

              {/* 这个暂时不显示 */}
              {/* <Text
              style={{
                marginTop: 40,
                color: "#999",
                fontSize: 13,
                width: "100%",
                textAlign: "right",
                paddingRight: 5,
              }}
            >
              Max:0.003234 BTC
            </Text> */}

              <View
                style={{
                  alignItems: "center",
                  borderColor: isInputAmountFcous
                    ? themeColor
                    : "rgba(191, 194, 204, 0.5)",
                  flexDirection: "row",
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  marginTop: 40,
                }}
              >
                <TextInput
                 placeholder={t("c_amount")}
                  keyboardType={
                    Platform.OS == "android" ? "numeric" : undefined
                  }
                  value={inputAmount}
                  onChangeText={(text) => {
                    // const decimalPattern = /^\d*\.?\d{0,8}$/;
                    const decimalPattern = new RegExp(
                      `^\\d*\\.?\\d{0,${mrc20Data.decimals}}$`
                    );

                    if (parseFloat(text) > mrc20Data.balance) {
                      ToastView({
                        text: "Insufficient balance",
                        type: "error",
                      });
                      return;
                    }
                    if (Platform.OS === "android") {
                      const decimalRegex = /^(\d+(\.\d*)?)?$/;
                      if (
                        decimalRegex.test(text) &&
                        decimalPattern.test(text)
                      ) {
                        setInputAmount(text);
                      }
                    } else {
                      if (decimalPattern.test(text)) {
                        setInputAmount(text);
                      }
                      // setInputAmount(text);
                    }

                    if (text.length > 0 && inputAddress.length > 0) {
                      setNextBtnColor("rgba(23, 26, 255, 1)");
                    } else {
                      setNextBtnColor("rgba(23, 26, 255, 0.5)");
                    }
                  }}
                  onFocus={() => {
                    // setIsInputAddressFcous(false);
                    // setIsInputAmountFcous(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    marginLeft: 10,
                    paddingRight: 10,
                  }}
                />

                {/* <Text style={{ marginRight: 10, fontSize: 14, color: "#333" }}>
                BTC
              </Text> */}

                <TouchableWithoutFeedback
                  onPress={() => {
                    setInputAmount(mrc20Data.balance);
                  }}
                >
                  <Text
                    style={[metaStyles.smallDefaultText, { marginRight: 10 }]}
                  >
                    {t("c_max")}
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            </View>

            <View style={{ marginHorizontal: 20, paddingHorizontal: 25 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                {t("c_balance")}
                </Text>
                <Text style={{ color: "#999", fontSize: 14 }}>
                  {mrc20Data.balance} {mrc20Data.tick}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                {t("c_pending")}
                </Text>
                <Text style={{ color: "#999", fontSize: 14 }}>
                  {mrc20Data.unsafeBalance} {mrc20Data.tick}
                </Text>
              </View>

              {/* <View style={{ flexDirection: "row" ,justifyContent: "space-between" ,marginTop: 10}}>
              <Text style={{ color: "#999" ,fontSize: 14}}>Pending</Text>
              <Text style={{ color: "#999" ,fontSize: 14}}>0.00000546 TBC</Text>
            </View> */}

              <TouchableWithoutFeedback
                onPress={() => {
                  setIsShowFeed(true);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 15,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                  {t("c_fee_rate")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: "#999", fontSize: 14 }}>
                    {feed} sat/vB
                  </Text>
                  <Image
                    source={require("../../../image/list_icon_ins.png")}
                    style={{ width: 18, height: 18 }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>

            {/* <View style={{ flex: 1 }} /> */}
            <View
              style={{
                marginHorizontal: 20,
                paddingHorizontal: 25,
                marginTop: 90,
              }}
            >
              <RoundSimButton
                title={t("c_next")}
                event={() => {
                  if (!inputAddress) {
                    ToastView({ text: "Please input address", type: "error" });
                    return;
                  }

                  if (!inputAmount) {
                    ToastView({ text: "Please input amount", type: "error" });
                    return;
                  }

                  if (walletMode === wallet_mode_cold) {
                    // sendColdBtc();
                  } else {
                    sendBtc();
                  }
                  // sendBtc();
                  // navigate('SendBtcConfirmPage')
                  // setConfirmDailogState(true);
                }}
                roundStytle={{}}
                textColor="#fff"
                color={nextBtnColor}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
