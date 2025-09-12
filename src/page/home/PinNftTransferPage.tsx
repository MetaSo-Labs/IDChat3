import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Keyboard,
  ImageBackground,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RoundSimButton,
  RoundSimButtonFlee,
  TitleBar,
  ToastView,
  VerifyModal,
} from "@/constant/Widget";
import { FeedBean, FeedBtcObject } from "@/types/btcfeed";
import { inputNormalBgColor, themeColor } from "@/constant/Constants";
import { useData } from "@/hooks/MyProvider";
import { ScriptType, SignType } from "@metalet/utxo-wallet-service";
import { getBtcUtxos, getInscriptionUtxo, getMetaPin } from "@/queries/utxos";
import { getRandomID, goToWebScan, parseToSpace } from "@/utils/WalletUtils";
import { broadcastBtc, fetchBtcFeed } from "@/api/metaletservice";
import { navigate } from "@/base/NavigationService";
import { addMetaletSafeUtxo } from "@/wallet/wallet";

export default function PinNftTransferPage({ route }) {
  const { nftDetail } = route.params;

  const [inputAddress, setInputAddress] = useState("");

  //wallet
  const { metaletWallet, updateMetaletWallet } = useData();
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
  const [confirmDailogState, setConfirmDailogState] = useState(false);

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
  // commfirn
  const [fee, setfee] = useState("");
  const [rawTx, setRawTx] = useState<string>();
  const [isShowVerify, setIsShowVerify] = useState(false);
  const [transferSuccedDailogState, setTransferSuccedDailogState] =
    useState(false);
  const [transactionID, setTransactionID] = useState("");

  const { needRefreshHome, updateNeedRefreshHome } = useData();

  useEffect(() => {
    getFeed();
  }, []);

  async function sendBRC20() {
    try {
      const needRawTx =
        metaletWallet.currentBtcWallet.getScriptType() === ScriptType.P2PKH;
      // const utxo = await getInscriptionUtxo(nftDetail.inscriptionId, needRawTx);
      console.log("nft", nftDetail);

      const metaPin = await getMetaPin(nftDetail.itemPinId, needRawTx);
      const [txId, outputIndex] = metaPin.output.split(":");
      const utxo = {
        txId,
        outputIndex: Number(outputIndex),
        satoshis: metaPin.outputValue,
        confirmed: metaPin.genesisHeight > 0,
        rawTx: metaPin.rawTx,
      };

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
        setRawTx(_rawTx);
        setConfirmDailogState(true);
      }
    } catch (e) {
      ToastView({ text: e.toString(), type: "error" });
      console.log(e);
    }
  }

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
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* feed */}
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

        <Modal visible={transferSuccedDailogState} transparent={true}>
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
              <Text
                style={{ textAlign: "center", fontSize: 16, color: themeColor }}
              >
                Sent Successfully
              </Text>

              <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
                Recipient Address
              </Text>
              <Text
                numberOfLines={1}
                style={{ marginTop: 10, color: "#333", fontSize: 14 }}
              >
                {inputAddress}
              </Text>

              <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
                Transaction ID
              </Text>

              <TouchableWithoutFeedback
                onPress={() => {
                  goToWebScan("btc", transactionID);
                }}
              >
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={{ color: "#333", fontSize: 14, flex: 1 }}
                  >
                    {transactionID}
                  </Text>
                  <Image
                    source={require("../../../image/link_ins_icon.png")}
                    style={{ width: 15, height: 15, marginLeft: 2 }}
                  />
                </View>
              </TouchableWithoutFeedback>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  justifyContent: "space-between",
                }}
              >
                {/* <RoundSimButtonFlee
                title={"Cancel"}
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
              /> */}

                <RoundSimButtonFlee
                  title={"OK"}
                  style={{ borderRadius: 10, height: 45 }}
                  textColor="#fff"
                  event={() => {
                    setTransferSuccedDailogState(false);
                    navigate("HomePage");
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

            // setTransactionID("txid023498493284");
            // setTransferSuccedDailogState(true);

            const { code, message, processingTime, data } =
              await broadcastBtc(rawTx);
            if (data) {
              // setIsShowLoading(false);
              updateNeedRefreshHome(getRandomID());
              setTransactionID(data);
              setTransferSuccedDailogState(true);
              addMetaletSafeUtxo(rawTx, data);
            }
          }}
        />
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
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    height: 120,
                    width: 120,
                    marginTop: 10,
                    marginRight: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* <Text style={{color:'#fff',fontSize:10}}>{JSON.stringify(item.nftShowContent)}</Text> */}

                  {nftDetail.contentTypeDetect.includes("image") ||
                  nftDetail.showImage !== "" ? (
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        height: 120,
                        width: 120,
                        marginTop: 10,
                        marginRight: 10,
                        // paddingHorizontal: 10,
                        // paddingVertical: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: inputNormalBgColor,
                        borderWidth: 1,
                      }}
                    >
                      <ImageBackground
                        source={{ uri: nftDetail.showImage }} // 替换为你的图片路径
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 5,
                          overflow: "hidden",
                        }}
                      >
                        <View style={{ flex: 1 }}></View>

                        <View style={{ flexDirection: "row", marginBottom: 2 }}>
                          <View style={{ flex: 1 }} />
                          <View
                            style={{
                              justifyContent: "center",
                              flexDirection: "row",
                              width: 50,
                              backgroundColor: "#767EFF",
                              marginTop: 3,
                              // backgroundColor: 'rgba(23, 26, 255, 0.1)',
                              borderRadius: 5,
                              marginRight: 5,
                              marginBottom: 5,
                            }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 10,
                                paddingHorizontal: 2,
                                paddingVertical: 2,
                              }}
                            >
                              546 sat{" "}
                            </Text>
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                  ) : (
                    <View
                      style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        width: 50,
                        backgroundColor: "#767EFF",
                        borderRadius: 5,
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          paddingHorizontal: 2,
                          paddingVertical: 2,
                        }}
                      >
                        {nftDetail.outputValue} sat{" "}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View>
                <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
                  From
                </Text>
                <Text style={{ marginTop: 5, color: "#333", fontSize: 14 }}>
                  {metaletWallet.currentBtcWallet.getAddress()}
                </Text>
              </View>

              <View>
                <Text style={{ marginTop: 10, color: "#666", fontSize: 14 }}>
                  To
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
                <Text style={{ color: "#666", fontSize: 14 }}>Network Fee</Text>
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
                  title={"Cancel"}
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
                  title={"Confirm"}
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

        <View style={{ flex: 1 }}>
          <TitleBar title="Transfers NFT" />

          <View style={{ padding: 15, alignItems: "center", marginTop: 20 }}>
            {nftDetail.contentTypeDetect.includes("image") ||
            nftDetail.showImage !== "" ? (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  height: 150,
                  width: 150,
                  marginTop: 10,
                  marginRight: 10,
                  // paddingHorizontal: 10,
                  // paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: inputNormalBgColor,
                  borderWidth: 1,
                }}
              >
                <ImageBackground
                  source={{ uri: nftDetail.showImage }} // 替换为你的图片路径
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <View style={{ flex: 1 }}></View>

                  <View style={{ flexDirection: "row", marginBottom: 2 }}>
                    <View style={{ flex: 1 }} />
                    <View
                      style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        width: 50,
                        backgroundColor: "#767EFF",
                        marginTop: 3,
                        // backgroundColor: 'rgba(23, 26, 255, 0.1)',
                        borderRadius: 5,
                        marginRight: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          paddingHorizontal: 2,
                          paddingVertical: 2,
                        }}
                      >
                        546 sat{" "}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "#171AFF",
                  borderRadius: 8,
                  height: 150,
                  width: 150,
                  marginTop: 10,
                  marginRight: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <Text style={{color:'#fff',fontSize:10}}>{JSON.stringify(item.nftShowContent)}</Text> */}
                <Text style={{ color: "#fff", fontSize: 13, marginBottom: 20 }}>
                  {nftDetail.contentSummary}
                </Text>

                <View
                  style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    width: 50,
                    backgroundColor: "#767EFF",
                    borderRadius: 5,
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      paddingHorizontal: 2,
                      paddingVertical: 2,
                    }}
                  >
                    {" "}
                    546 sat{" "}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {/* content */}
          <View style={{ padding: 20 }}>
            <View
              style={{
                alignItems: "center",
                borderColor: "rgba(191, 194, 204, 0.5)",
                flexDirection: "row",
                borderWidth: 1,
                height: 50,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TextInput
                multiline={true}
                placeholder="Recipient's address"
                onChangeText={(text) => {
                  setInputAddress(text);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  marginLeft: 10,
                }}
              />
            </View>
            {/* feedRate */}
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
                <Text style={{ color: "#333", fontSize: 14 }}>Fee Rate</Text>
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

          <View style={{ flex: 1 }} />

          <View style={{ margin: 20 }}>
            <RoundSimButton
              title="Next"
              event={() => {
                try {
                  sendBRC20();
                } catch (error) {
                  ToastView({ text: error.toString(), type: "error" });
                }
              }}
              textColor="#fff"
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
