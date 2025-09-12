import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
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
  VerifyModal,
  styles,
} from "../../constant/Widget";
import {
  grayNormalColor,
  inputNormalBgColor,
  metaStyles,
  themeColor,
} from "../../constant/Constants";
import { navigate } from "../../base/NavigationService";
import { useData } from "../../hooks/MyProvider";
import { Wallet, API_TARGET, API_NET, FtManager } from "meta-contract";
import { broadcastSpace, fetchMvcFeed } from "../../api/metaletservice";
import {
  caculateToSatDecimal,
  formatToDecimal,
  getRandomID,
  getWalletNetwork,
  isObserverWalletMode,
} from "../../utils/WalletUtils";
import { getIconUri } from "@mvc-org/mvc-resources";
import { removeTrailingZeros } from "@/utils/StringUtils";
import { useTranslation } from "react-i18next";
import { getDefaultMVCTRate } from "@/queries/transaction";
import { FeedBean, FeedBtcObject } from "@/types/btcfeed";

export default function SendMvcFtPage({ route }) {
  const [nextBtnColor, setNextBtnColor] = useState("rgba(23, 26, 255, 0.5)");
  const [inputAddress, setInputAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [isInputAddressFcous, setIsInputAddressFcous] = useState(false);
  const [isInputAmountFcous, setIsInputAmountFcous] = useState(false);

  // 扫描
  const [isScan, setIsScan] = useState(false);

  //提示
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [confirmDailogState, setConfirmDailogState] = useState(false);

  // verfiy
  const [isShowVerify, setIsShowVerify] = useState(false);
  const [txid, setTxid] = useState("");

  const { metaletWallet, updateMetaletWallet } = useData();

  // commfirn
  const [fee, setfee] = useState("");
  const [total, settotal] = useState("");
  const [rawTx, setrawTx] = useState("");
  const { needRefreshHome, updateNeedRefreshHome } = useData();
  const { t } = useTranslation();

  const [isShowFeed, setIsShowFeed] = useState(false);
  const feedModeSlow = "Slow";
  const feedModeAvg = "Avg";
  const feedModeFast = "Fast";
  const feedModeCustom = "Custom";
  const [feedModeType, setFeedModeType] = useState(feedModeAvg);
  const textInputRef = useRef(null);

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

  const [feed, setFeed] = useState("5");
  const [feedReady, setFeedReady] = useState("5");

  useEffect(() => {
    getFeed();
  }, []);
  async function getFeed() {
    const feedObj: FeedBtcObject = await fetchMvcFeed();

    if (feedObj) {
      let feedList = feedObj.data.list;
      setSlowFeed(feedList[2]);
      setAvgFeed(feedList[1]);
      setFastFeed(feedList[0]);
      setFeed(feedList[1].feeRate.toString());
      setFeedReady(feedList[1].feeRate.toString());
    }
  }

  const { mvcFtData } = route.params;
  let ImageUrl = getIconUri({
    type: "metaContract",
    codehash: mvcFtData.codeHash,
    genesis: mvcFtData.genesis,
  });
  if (!ImageUrl) {
    ImageUrl = "1";
  }

  function ShowNotice(notice: string) {
    setNoticeContent(notice);
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 1500);
  }

  const sendSpace = async () => {
    if (inputAddress == "" || inputAmount == "") {
      return;
    }
    // let amount = Math.floor(parseFloat(inputAmount) * 100000000);
    // let amount = caculateToSatDecimal(
    //   parseFloat(inputAmount),
    //   mvcFtData.decimal
    // );

    // const divisor = Math.pow(10, mvcFtData.decimal);
    // const amount = (parseFloat(inputAmount) * divisor).toFixed(
    //   mvcFtData.decimal
    // );

    const amoutResult = caculateToSatDecimal(
      parseFloat(inputAmount),
      mvcFtData.decimal
    );

    if (parseFloat(amoutResult) <= 0) {
      return;
    }

    const privateKey: string = metaletWallet.currentMvcWallet.getPrivateKey();
    // const wallet = new Wallet(priviteKey, API_NET.MAIN, 1, API_TARGET.MVC);
    setIsShowLoading(true);
    const network = await getWalletNetwork();

    if (!feed) {
      const sfeed = await getDefaultMVCTRate();
      setFeed(sfeed.toString());
    }

    const ftManager = new FtManager({
      network: network === "mainnet" ? API_NET.MAIN : API_NET.TEST,
      purse: privateKey,
      feeb: Number(feed),
      apiTarget: API_TARGET.APIMVC,
      // apiTarget: API_TARGET.MVC,
    });

    // const largestUtxo = await ftManager.api
    //   .getUnspents(metaletWallet.currentMvcWallet.getAddress())
    //   .then((utxos) => {
    //     return utxos.reduce((prev, curr) => {
    //       if (curr.satoshis > prev.satoshis) return curr;
    //       return prev;
    //     });
    //   })
    //   .then((utxo) => {
    //     // add wif to utxo
    //     return {
    //       ...utxo,
    //       wif: privateKey,
    //     };
    //   });

    //
    console.log(inputAddress);
    // console.log(inputAmount);
    console.log(amoutResult);

    const transferRes = await ftManager
      .transfer({
        codehash: mvcFtData.codeHash!,
        genesis: mvcFtData.genesis!,
        senderWif: privateKey,
        receivers: [
          {
            address: inputAddress,
            amount: amoutResult,
          },
        ],
        // utxos: [largestUtxo],
      })
      .catch((err) => {
        setIsShowLoading(false);
        console.log("报错 ： " + err.message);
        ShowNotice(err.message);
      });
    if (transferRes) {
      setIsShowLoading(false);
      // console.log("result ： " + JSON.stringify(transferRes));
      setrawTx(transferRes.txHex);
      // setTxid(transferRes.txid);

      if (transferRes.txid != null) {
        updateNeedRefreshHome(getRandomID());

        navigate("SendSuccessPage", {
          result: {
            chain: "mvc",
            symbol: mvcFtData.symbol.toUpperCase(),
            txid: transferRes.txid,
            amount: inputAmount,
            address: inputAddress,
          },
        });
      }
      // setConfirmDailogState(true);
    }
    // if (sentRes) {
    //   const fee = Transaction.fromHex(sentRes.txHex).virtualSize();
    //   const total = amount + fee;
    //   setrawTx(sentRes.txHex);
    //   setConfirmDailogState(true);
    //   setfee((parseFloat(fee.toString()) / 100000000).toFixed(8));
    //   settotal((parseFloat(total.toString()) / 100000000).toFixed(8));
    //   console.log("fee" + fee);
    //   console.log("total" + total);
    // }

    // wallet
    //   .send(inputAddress, amount, { noBroadcast: true })
    //   .then((res) => {
    //     console.log(res);
    //     setIsShowLoading(false);
    //     // navigate("SendSpaceSuccessPage");
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingModal
        isShow={isShowLoading}
        isCancel={true}
        event={() => {
          setIsShowLoading(false);
        }}
      />

      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

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
                source={require("../../../image/receive_mvc_icon.png")}
                style={{ width: 50, height: 50 }}
              /> */}

              {mvcFtData.imageError ? (
                <CircleAvatarLetter
                  letterStr={mvcFtData.name.substring(0, 1)}
                />
              ) : (
                <CircleAvatar
                  imageUrl={ImageUrl}
                  event={() => {
                    // refreshData(mvcFtData.txid);
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
                {inputAmount} {mvcFtData.symbol.toUpperCase()}
              </Text>
            </View>

            <View>
              <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
                {t("c_from")}
              </Text>
              <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                {metaletWallet.currentMvcWallet.getAddress()}
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
              <Text style={{ color: "#666", fontSize: 14 }}>
                {" "}
                {t("c_amount")}
              </Text>
              <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                {inputAmount} {mvcFtData.symbol.toUpperCase()}
              </Text>
            </View>
            {/* 
            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>
                Fees(Estimated)
              </Text>
              <Text style={{ color: "#333", fontSize: 14 }}>{fee} SPACE</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>Total</Text>
              <Text style={{ color: "#333", fontSize: 14 }}>{total} SPACE</Text>
            </View> */}

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
                    <Text style={{ color: "#333" }}>{userSlowFeed.title}</Text>
                    <Text style={{ marginTop: 3, color: "#000" }}>
                      {userSlowFeed.feeRate} sat/vB
                    </Text>
                    <Text style={{ color: "#666", fontSize: 10, marginTop: 3 }}>
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
                    <Text style={{ color: "#666", fontSize: 10, marginTop: 3 }}>
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
                    <Text style={{ color: "#333" }}>{userFastFeed.title}</Text>
                    <Text style={{ marginTop: 3, color: "#000" }}>
                      {userFastFeed.feeRate} sat/vB
                    </Text>
                    <Text style={{ color: "#666", fontSize: 10, marginTop: 3 }}>
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
                    keyboardType={Platform.OS === "ios" ? undefined : "numeric"}
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
        event={async () => {
          setIsShowVerify(false);
          // const { txid, message } = await broadcastSpace(rawTx);

          sendSpace();

          //old
          // if (txid != null) {
          //   updateNeedRefreshHome(getRandomID());

          //   navigate("SendSuccessPage", {
          //     result: {
          //       chain: "mvc",
          //       symbol: mvcFtData.symbol.toUpperCase(),
          //       txid: txid,
          //       amount: inputAmount,
          //       address: inputAddress,
          //     },
          //   });
          // }

          // navigate("SendSuccessPage", {
          //   result: {
          //     chain:"mvc",
          //     symbol:mvcFtData.symbol.toUpperCase(),
          //     txid: "txid",
          //     amount: inputAmount,
          //     address: inputAddress,
          //   },
          // });
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
          <TitleBar title={t("h_send")} />

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
              source={require("../../../image/receive_mvc_icon.png")}
              style={{ width: 70, height: 70 }}
            /> */}

            {mvcFtData.imageError ? (
              <CircleAvatarLetter letterStr={mvcFtData.name.substring(0, 1)} />
            ) : (
              <CircleAvatar
                imageUrl={ImageUrl}
                event={() => {
                  // refreshData(mvcFtData.txid);
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
              {mvcFtData.name}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                backgroundColor: "rgba(23, 26, 255, 0.2)",
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: "#171AFF",
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                MetaContract
              </Text>
            </View>

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
                  setInputAddress(text);
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
                  flex: 1,
                  // textAlignVertical: "left",
                  padding: 10,
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

            <View style={{ flexDirection: "row", marginTop: 40 }}>
              <Text
                style={{
                  color: "#333",
                  fontSize: 16,
                }}
              >
                {t("c_amount")}
              </Text>

              <View style={{ flex: 1 }} />

              <TouchableWithoutFeedback
                onPress={() => {
                  setInputAmount(
                    formatToDecimal(mvcFtData.confirmed, mvcFtData.decimal)
                  );
                }}
              >
                <Text
                  style={[metaStyles.smallDefaultText, { marginRight: 10 }]}
                >
                  {t("c_max")}
                </Text>
              </TouchableWithoutFeedback>
            </View>

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
                marginTop: 10,
              }}
            >
              <TextInput
                placeholder={
                  formatToDecimal(mvcFtData.confirmed, mvcFtData.decimal) +
                  " " +
                  mvcFtData.symbol.toUpperCase()
                }
                value={inputAmount}
                onChangeText={(text) => {
                  // const decimalPattern = new RegExp(
                  //   `^\\d*\\.?\\d{0,${mvcFtData.decimals}}$`
                  // );

                  const decimalPattern = new RegExp(`^\\d*\\.?\\d{0,8}$`);
                  if (decimalPattern.test(text)) {
                    setInputAmount(text);
                  }
                  // setInputAmount(text);
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

              <Text style={{ marginRight: 10, fontSize: 14, color: "#333" }}>
                {mvcFtData.symbol.toUpperCase()}
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

            <RoundSimButton
              title={t("c_next")}
              event={async () => {
                const isCold = await isObserverWalletMode();
                if (!isCold) {
                  // sendSpace();
                  setConfirmDailogState(true);
                }
              }}
              roundStytle={{ marginTop: 50 }}
              textColor="#fff"
              color={nextBtnColor}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
