import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  CircleAvatar,
  CircleAvatarLetter,
  LoadingNoticeModal,
  NoMoreDataView,
  TitleBar,
} from "../../constant/Widget";
import { goBack, navigate } from "../../base/NavigationService";
import {
  inputNormalBgColor,
  litterWhittleBgColor,
  metaStyles,
  themeColor,
} from "../../constant/Constants";
import { MvcActivityRecord } from "../../types/mvcrecord";
import {
  fetchBrc20Record,
  fetchBtcFtPrice,
  fetchIcons,
  fetchMvcFtRecord,
  fetchOneBrc20,
} from "../../api/metaletservice";
import { useData } from "../../hooks/MyProvider";
import * as Clipboard from "expo-clipboard";
import { formatTime } from "../../utils/MetaFunUiils";
import { SafeAreaView } from "react-native-safe-area-context";
import { MvcFtRecordData } from "../../api/type/MvcFtData";
import { getIconUri } from "@mvc-org/mvc-resources";
import { formatToDecimal, getWalletNetwork } from "../../utils/WalletUtils";
import {
  caculateOneBtcFtValue,
  caculateOneFtValue,
  getBtcBrc20Icon,
  getOneIcons,
} from "../../utils/AssertUtils";
import {
  AddressTokenSummary,
  Brc20DetailData,
  TokenBalance,
  TokenTransfer,
} from "@/api/type/Balance";
import {
  BtcFtOneRecordData,
  InscriptionsList,
} from "@/api/type/BtcFtOneRecordData";
import { Chain } from "@metalet/utxo-wallet-service";
import { IcoinsData } from "@/api/type/IcoinsData";
import { useTranslation } from "react-i18next";

export default function BRC20DetailPage({ route }) {
  const [mvcActivityList, setMvcActivityList] = useState<InscriptionsList[]>(
    []
  );
  const { btcAddress, updateBtcAddress } = useData();
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [isShowNotice, setIsShowNotice] = useState(false);
  const { metaletWallet, updateMetaletWallet } = useData();
  const [assertOneFt, setOneFtAssert] = useState("0.0");

  const [isErrorIcon, setisErrorIcon] = useState(false);

  const { brc20 } = route.params;

  //header brc20
  const [tokenTransferNum, setTokenTransferNum] = useState("");
  const [tokenAvaialeNum, setTokenAvaialeNum] = useState("");
  const [tokenAvaialePingNum, setTokenAvaialePingNum] = useState("");
  const [tokenTransferList, setTokenTransferList] = useState([]);
  const [tokenPingList, setTokenPingList] = useState([]);
  const [isSelectTransfer, setIsSelectTransfer] = useState(true);
  const [brc20Icons, setBrc20Icons] = useState<IcoinsData>();
  const { t } = useTranslation();

  useEffect(() => {
    // console.log("brc20: " + JSON.stringify(brc20));
    getActivityList(btcAddress);
  }, []);

  async function getActivityList(address: string) {
    const iconsData: IcoinsData = await fetchIcons();
    if (iconsData) {
      setBrc20Icons(iconsData);
    }

    const ftPriceData = await fetchBtcFtPrice();
    // console.log("ftPriceData: " + JSON.stringify(ftPriceData));

    const assertFt = caculateOneBtcFtValue([brc20], ftPriceData);
    // console.log("assertFt: " + assertFt);

    setOneFtAssert(assertFt);
    const network = await getWalletNetwork(Chain.BTC);

    const brc20Balance: Brc20DetailData = await fetchOneBrc20(
      address,
      network,
      brc20.ticker
    );

    console.log("brc20Balance: " + JSON.stringify(brc20Balance));
    // let tokeList = [];
    // const toke1: TokenTransfer = {
    //   ticker: "brc20",
    //   amount: "20",
    //   inscriptionId: "#2974",
    //   inscriptionNumber: 23,
    //   timestamp: 32,
    // };
    // const toke2: TokenTransfer = {
    //   ticker: "rdex",
    //   amount: "2321",
    //   inscriptionId: "#3248",
    //   inscriptionNumber: 23,
    //   timestamp: 32,
    // };
    // tokeList.push(toke1);
    // tokeList.push(toke2);
    const tokeList: TokenTransfer[] = brc20Balance.data.transferableList;
    const toke2: TokenTransfer = {
      ticker: "rdex",
      amount: "2321",
      inscriptionId: "#3248",
      inscriptionNumber: 23,
      timestamp: 32,
    };

    if (tokeList.length > 0) {
      let tokeList1 = [];
      tokeList1.push(tokeList[0]);
      if (tokeList.length > 1) {
        tokeList1.push(tokeList[1]);
      }
      setTokenTransferList(tokeList1);
    }

    const tokenBalance: TokenBalance = brc20Balance.data.tokenBalance;

    setTokenTransferNum(tokenBalance.transferableBalance);
    setTokenAvaialeNum(tokenBalance.availableBalanceSafe);
    setTokenAvaialePingNum(tokenBalance.availableBalanceUnSafe);

    let mvcActivityListData = await fetchBrc20Record(
      address,
      "btc",
      brc20.ticker
    );

    // console.log("resutl  ", mvcActivityListData);
    let brc20RecordList: InscriptionsList[] =
      mvcActivityListData.data.inscriptionsList;
    // brc20RecordList.push(mvcActivityListData.data.inscriptionsList[0])

    if (brc20RecordList.length == 0) {
      let record: InscriptionsList = {
        txId: "1",
        blockHeight: "",
        state: "",
        tokenType: "",
        actionType: "",
        fromAddress: "",
        toAddress: "",
        amount: "",
        token: "",
        inscriptionId: "",
        inscriptionNumber: "",
        index: "",
        location: "",
        msg: "",
        time: "",
      };
      setMvcActivityList([...brc20RecordList, record]);
    } else {
      setMvcActivityList([...brc20RecordList]);
    }
  }

  function ShowNotice(notice) {
    Clipboard.setString(notice);
    setNoticeContent("Copy Successful");
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 800);
  }

  const ListItem = ({ index, item }) => {
    let isIncome;
    let showAmount;
    // recordMoney = item.income - item.outcome;
    // showAmount = (recordMoney / 100000000).toFixed(8);
    // showAmount = formatToDecimal(recordMoney, parseFloat(brc20.decimal));
    showAmount = item.amount;
    // console.log('btc',btcAddress);
    // console.log("item: " + JSON.stringify(item));

    // console.log(formatTime(parseFloat(item.time)));

    if (item.toAddress == btcAddress) {
      isIncome = true;
    } else {
      isIncome = false;
    }

    let title = "";
    if (item.actionType == "transfer") {
      title = isIncome ? "Receive" : "Send";
    } else {
      title = item.actionType;
    }

    // let ImageUrl = getOneIcons('brc20',item.ticker,brc20Icons);
    // console.log("brc20 头像 ： ",ImageUrl);

    return (
      <View>
        {item.txId != "1" ? (
          <View>
            <View
              style={{
                width: "100%",
                marginTop: 20,
                borderRadius: 10,
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              {isIncome ? (
                <View>
                  <Image
                    source={require("../../../image/record_type_in.png")}
                    style={{ width: 35, height: 35 }}
                  />
                  {/* {brc20.imageError ? (
                  <View>
                    <CircleAvatarLetter
                      letterStr={brc20.name.substring(0, 1)}
                    />
                    <Image
                      source={require("../../../image/record_type_in.png")}
                      style={{ width: 5, height: 5 }}
                    />
                  </View>
                ) : (

                  <Image
                  source={require("../../../image/record_type_in.png")}
                  style={{
                    width: 35,
                    height: 35,
                  }}
                />
                  // <View
                  //   style={{
                  //     width: 50,
                  //     height: 50,
                  //     borderRadius: 50,
                  //     overflow: "hidden",
                  //   }}
                  // >
                  //   <Image
                  //     style={{ width: "100%", height: "100%" }}
                  //     source={{ uri: ImageUrl }}
                  //     onError={() => {}}
                  //   />
                  //   <Image
                  //     source={require("../../../image/record_type_in.png")}
                  //     style={{
                  //       position: "absolute",
                  //       width: 5,
                  //       height: 5,
                  //       bottom: 10,
                  //       right: 0,
                  //     }}
                  //   />
                  // </View>

                  // <View>
                  //   <Image
                  //     style={{ width: 50, height: 50 }}
                  //     source={{ uri: ImageUrl }}
                  //     onError={() => {}}
                  //   />

                  //   <Image
                  //     source={require("../../../image/record_type_in.png")}
                  //     style={{
                  //       position: "absolute",
                  //       width: 5,
                  //       height: 5,
                  //       bottom: 0,
                  //       right: 0,
                  //     }}
                  //   />
                  // </View>
                )} */}
                </View>
              ) : (
                // <Image
                //   source={require("../../../image/assert_mvcrecord_send_icon.png")}
                //   style={{ width: 35, height: 35 }}
                // />
                <Image
                  source={require("../../../image/record_type_out.png")}
                  style={{
                    width: 35,
                    height: 35,
                  }}
                />
              )}

              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, marginLeft: 10, flexDirection: "row" }}>
                  <Text
                    style={{ fontSize: 16, color: "#000000", marginBottom: 10 }}
                  >
                    {title}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: isIncome ? "green" : "red",
                      marginBottom: 10,
                      // textAlign: "right",
                    }}
                  >
                    {isIncome ? "+" + showAmount : showAmount}{" "}
                    {item.token.toString().toUpperCase()}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 10,

                    alignItems: "flex-end",
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      ShowNotice(item.txId);
                    }}
                  >
                    <View style={{ flexDirection: "row" }}>
                      <Text style={metaStyles.grayTextSmall66}>
                        {formatTime(parseFloat(item.time))}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={[
                          metaStyles.grayTextSmall66,
                          { textAlign: "right", width: 100 },
                        ]}
                      >
                        {item.txId}
                      </Text>

                      <Image
                        source={require("../../../image/meta_copy_icon.png")}
                        style={{ width: 15, height: 15, marginLeft: 5 }}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              // width: "100%",
              // height: "100%",
              // opacity: isShow?1:0,
            }}
          >
            <Image
              source={require("../../../image/assert_record_nodata_icon.png")}
              style={{ width: 38, height: 53, marginTop: 50 }}
            />

            <Text style={[metaStyles.grayTextdefault66, { marginTop: 20 }]}>
              No activities
            </Text>
          </View>
        )}
      </View>
    );
  };
  const EmptyView = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../../image/btc_brc20_empty_icon.png")}
          style={{ width: 54, height: 50, marginTop: 45 }}
          resizeMode="cover"
        />

        <Text
          style={[metaStyles.grayText99, { marginTop: 20, marginBottom: 20 }]}
        >
          Empty
        </Text>
      </View>
    );
  };

  const ListHeader = () => {
    let ImageUrl = getBtcBrc20Icon(brc20.ticker);
    // let ImageUrl = 'https://www.metalet.space/wallet-api/v3/coin/brc20/icon/rdex.png'
    // console.log("ImageUrl", ImageUrl);
    if (!ImageUrl) {
      ImageUrl = "1";
    }

    // console.log("ImageUrl", ImageUrl);
    return (
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {isErrorIcon ? (
          <CircleAvatarLetter
            widthC={60}
            heightC={60}
            letterStr={brc20.ticker.substring(0, 1)}
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
            marginTop: 20,
            fontSize: 25,
            fontWeight: "bold",
          }}
        >
          {/* {formatToDecimal(brc20.confirmed, brc20.decimal)}{" "}
          {brc20.symbol.toUpperCase()} */}
          {brc20.overallBalance} {brc20.ticker.toUpperCase()}
        </Text>

        <Text
          style={{
            color: "#666",
            textAlign: "center",
            lineHeight: 20,
            marginTop: 10,
            fontSize: 18,
          }}
        >
          ${assertOneFt}
        </Text>

        <View
          style={{
            marginTop: 40,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              navigate("TransferBrc20FirstPage", {
                brc20: brc20,
              });
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F3F3FF",
                borderRadius: 30,
                paddingVertical: 20,
                paddingHorizontal: 30,
                alignItems: "center",
                justifyContent: "center",
                width: "40%",
              }}
            >
              <Image
                source={require("../../../image/assert_send_icon.png")}
                style={{ width: 15, height: 15 }}
              />

              <Text
                style={{
                  color: themeColor,
                  textAlign: "center",
                  marginLeft: 10,
                  lineHeight: 20,
                  fontSize: 18,
                }}
              >
                {t("h_send")}
              </Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={() => {
              navigate("ReceivePage", { myCoinType: "BTC" });
            }}
          >
            <View
              style={{
                flexDirection: "row",
                backgroundColor: themeColor,
                borderRadius: 30,
                paddingVertical: 20,
                paddingHorizontal: 30,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 20,
                width: "40%",
              }}
            >
              <Image
                source={require("../../../image/assert_receive_icon.png")}
                style={{ width: 15, height: 15 }}
              />

              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  marginLeft: 10,
                  lineHeight: 20,
                  fontSize: 18,
                }}
              >
                   {t("h_receive")}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* weib */}
        <View
          style={[
            {
              borderColor: "rgba(191, 194, 204, 0.5)",
              borderWidth: 1,
              borderRadius: 5,
              marginTop: 30,
              marginHorizontal: 20,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setIsSelectTransfer(true);
              }}
            >
              <View style={{ flex: 1, alignItems: "center", paddingTop: 20 }}>
                <Text style={metaStyles.largeDefaultLittleText}>
                  {tokenTransferNum}
                </Text>
                <Text style={[metaStyles.grayTextSmall66, { marginTop: 5 }]}>
                  Transferable
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <View
              style={{
                backgroundColor: inputNormalBgColor,
                width: 0.5,
                height: 20,
              }}
            />
            <TouchableWithoutFeedback
              onPress={() => {
                setIsSelectTransfer(false);
              }}
            >
              <View style={{ flex: 1, alignItems: "center", paddingTop: 20 }}>
                <Text style={metaStyles.largeDefaultLittleText}>
                  {tokenAvaialeNum}{" "}
                  {parseFloat(tokenAvaialePingNum) > 0 && (
                    <Text style={{ color: "#666" }}>
                      + {tokenAvaialePingNum}
                    </Text>
                  )}
                </Text>
                <Text style={[metaStyles.grayTextSmall66, { marginTop: 5 }]}>
                  Available
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <View
              style={{
                width: "50%",
                height: isSelectTransfer ? 2 : 0.5,
                backgroundColor: isSelectTransfer
                  ? themeColor
                  : inputNormalBgColor,
              }}
            />
            <View
              style={{
                width: "50%",
                height: isSelectTransfer ? 0.5 : 2,
                backgroundColor: isSelectTransfer
                  ? inputNormalBgColor
                  : themeColor,
              }}
            />
          </View>

          {isSelectTransfer &&
            (tokenTransferList.length > 0 ? (
              <View>
                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                  numColumns={2}
                  style={{ marginHorizontal: 20 }}
                  data={tokenTransferList}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableWithoutFeedback
                        onPress={() => {
                          if (item.inscriptionNumber === -1) {
                            console.log("inscriptionNumber===-1");
                            return;
                          }
                          console.log("igo");
                        }}
                      >
                        <View
                          style={{
                            marginTop: 20,
                            flex: 1,
                            marginLeft: index == 0 ? 0 : 20,
                          }}
                        >
                          <View
                            style={{
                              paddingTop: 10,
                              width:
                                tokenTransferList.length <= 1 ? "50%" : "100%",
                              marginBottom: 20,
                              alignItems: "center",
                              backgroundColor: litterWhittleBgColor,
                              borderRadius: 10,
                            }}
                          >
                            <Text
                              style={[
                                metaStyles.grayTextSmall66,
                                { marginTop: 20 },
                              ]}
                            >
                              {item.ticker.toUpperCase()}
                            </Text>

                            <Text
                              style={[
                                metaStyles.largeDefaultLittleText,
                                { marginTop: 15 },
                              ]}
                            >
                              {item.amount}
                            </Text>

                            {item.inscriptionNumber == -1 && (
                              <View
                                style={{
                                  backgroundColor: "#FF8F1F",
                                  width: "100%",
                                  borderBottomEndRadius: 10,
                                  borderBottomStartRadius: 10,
                                  alignItems: "center",
                                  paddingVertical: 8,
                                  marginTop: 25,
                                  flexDirection: "row",
                                  justifyContent: "center",
                                }}
                              >
                                <ActivityIndicator
                                  size={"small"}
                                  color={"#fff"}
                                />
                                <Text style={{ color: "#fff", marginLeft: 5 }}>
                                  Confirm
                                </Text>
                              </View>
                            )}

                            {item.inscriptionNumber != -1 && (
                              <View
                                style={{
                                  backgroundColor: themeColor,
                                  width: "100%",
                                  borderBottomEndRadius: 10,
                                  borderBottomStartRadius: 10,
                                  alignItems: "center",
                                  paddingVertical: 8,
                                  marginTop: 25,
                                }}
                              >
                                <Text style={{ color: "#fff" }}>
                                  # {item.inscriptionNumber}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    );
                  }}
                />

                {tokenTransferList.length >= 3 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ color: "#666", fontSize: 16 }}>All</Text>
                    <Image
                      source={require("../../../image/wallets_close_icon.png")}
                      style={{ width: 10, height: 10, marginLeft: 5 }}
                    />
                  </View>
                )}
              </View>
            ) : (
              <EmptyView />
            ))}

          {isSelectTransfer == false && EmptyView()}

          {/* 将接口数据填充 */}
          {/* 两个list 进行切换选择 */}
          {/* 显示历史收到数据 */}
          {/* 两个Receive 和Send  */}
        </View>
      </View>
    );
  };

  const listHeaderComponent = <View>{ListHeader()}</View>;

  //   const listHeaderComponent = mvcActivityList.length === 0 ? ListHeader() : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />
      <View style={{ flex: 1 }}>
        <TitleBar />
        <FlatList
          data={mvcActivityList}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={ListItem}
          ListHeaderComponent={listHeaderComponent}
        />
      </View>
    </SafeAreaView>
  );
}
