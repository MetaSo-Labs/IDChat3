import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  FlatList,
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
  grayNormalColor,
  metaStyles,
  themeColor,
} from "../../constant/Constants";
import { MvcActivityRecord } from "../../types/mvcrecord";
import {
  fetchMrc20RecordList,
  fetchMvcFtPrice,
  fetchMvcFtRecord,
} from "../../api/metaletservice";
import { useData } from "../../hooks/MyProvider";
import * as Clipboard from "expo-clipboard";
import { formatTime } from "../../utils/MetaFunUiils";
import { SafeAreaView } from "react-native-safe-area-context";
import { MvcFtRecordData } from "../../api/type/MvcFtData";
import { getIconUri } from "@mvc-org/mvc-resources";
import { formatToDecimal } from "../../utils/WalletUtils";
import { caculateOneFtValue } from "../../utils/AssertUtils";
import useNetworkStore from "@/stores/useNetworkStore";
import { Mrc20Record } from "@/api/type/Mrc20RecordData";
import { removeTrailingZeros2 } from "@/utils/StringUtils";
import { useTranslation } from "react-i18next";
import { wallet_mode_observer } from "@/utils/AsyncStorageUtil";

export default function Mrc20DetailPage({ route }) {
  const { mrc20Data } = route.params;
  const [mrc20RecordList, setMrc20RecordList] = useState<Mrc20Record[]>([]);
  const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  const [noticeContent, setNoticeContent] = useState("Successful");
  const [isShowNotice, setIsShowNotice] = useState(false);
  const { metaletWallet, updateMetaletWallet } = useData();
  const { t } = useTranslation();

  const [assertOneFt, setOneFtAssert] = useState("0.0");
  // const { netWork, updateNetWork } = useData();
  const { network, switchNetwork } = useNetworkStore();
  // console.log("mrc20Data", mrc20Data);
  const { walletMode, updateWalletMode } = useData();

  useEffect(() => {
    // console.log(mrc20Data);
    getActivityList();
  }, []);

  async function getActivityList() {
    const mrc20RecordData = await fetchMrc20RecordList(
      network,
      btcAddress,
      mrc20Data.mrc20Id
    );
    // console.log("mrc20RecordData ", JSON.stringify(mrc20RecordData));

    // let mvcActivityListData = await fetchMvcFtRecord(
    //   mvcAddress,
    //   mvcFtData.genesis,
    //   mvcFtData.codeHash
    // );
    // // console.log(mvcActivityListData);

    // const mvcActivityListData = mrc20RecordData.data.list;
    const mvcActivityListData1 = mrc20RecordData.data.list;
    const mvcActivityListData = mvcActivityListData1.filter((record) => {
      if (record.txType == 2) {
        return true;
      }
      return !(record.from === btcAddress && record.to === btcAddress);
    });

    // console.log(mvcActivityListData);

    if (mvcActivityListData != null && mvcActivityListData.length == 0) {
      let record: Mrc20Record = {
        txId: "1",
        tickId: "",
        tick: "",
        tokenName: "",
        decimals: "",
        metaData: "",
        from: "",
        to: "",
        amount: "",
        txType: 1,
        timestamp: 1,
      };
      setMrc20RecordList([...mrc20RecordList, record]);
      // setMvcActivityList([...mvcActivityListData, record]);
    } else {
      setMrc20RecordList([...mvcActivityListData]);
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
    let isIncomeType;
    let recordMoney;
    let showAmount;
    // recordMoney = item.income - item.outcome;
    // showAmount = (recordMoney / 100000000).toFixed(8);

    // showAmount = formatToDecimal(recordMoney, parseFloat(mvcFtData.decimal));

    let textColor;
    if (item.from === btcAddress && item.to === btcAddress) {
      isIncomeType = "Mint";
      // textColor = grayNormalColor;
      textColor = "green";
      // return;
    } else if (item.from === btcAddress && item.to != btcAddress) {
      isIncomeType = "Send";
      textColor = "red";
    } else if (item.to === btcAddress) {
      isIncomeType = "Receive";
      textColor = "green";
    }

    // let ImageUrl = getIconUri({
    //   type: "metaContract",
    //   codehash: mvcFtData.codeHash,
    //   genesis: mvcFtData.genesis,
    // });

    console.log("isIncomeType", isIncomeType);

    return (
      <View>
        {item.txId != "1" ? (
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
            {isIncomeType === "Receive" && (
              <View>
                <Image
                  source={require("../../../image/record_type_in.png")}
                  style={{ width: 35, height: 35 }}
                />
              </View>
            )}
            {isIncomeType === "Mint" && (
              <View>
                <Image
                  source={require("../../../image/record_type_in.png")}
                  style={{ width: 35, height: 35 }}
                />
              </View>
            )}

            {isIncomeType === "Send" && (
              <View>
                <Image
                  source={require("../../../image/record_type_out.png")}
                  style={{
                    width: 35,
                    height: 35,
                  }}
                />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <View style={{ flex: 1, marginLeft: 10, flexDirection: "row" }}>
                <Text
                  style={{ fontSize: 16, color: "#000000", marginBottom: 10 }}
                >
                  {isIncomeType == "Send" ? t("h_send") : t("h_receive")}
                </Text>
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    fontSize: mrc20Data.tick.length > 10 ? 10 : 16,
                    color: textColor,
                    marginBottom: 10,
                    textAlign: "right",
                    width: 200,
                  }}
                >
                  {isIncomeType === "Receive" || isIncomeType === "Mint"
                    ? "+" + item.amount.toString()
                    : isIncomeType === "Send"
                      ? "-" + item.amount.toString()
                      : item.amount.toString()}
                  {/* {" " + mrc20Data.tick.toString().toUpperCase()} */}
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
                      {formatTime(item.timestamp * 1000)}
                      {/* {formatTime(parseFloat(item.timestamp))} */}
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
              style={{ width: 38, height: 53, marginTop: 100 }}
            />

            <Text style={[metaStyles.grayTextdefault66, { marginTop: 20 }]}>
              No activities
            </Text>
          </View>
        )}
      </View>
    );
  };

  const ListHeader = () => {
    // let ImageUrl = getIconUri({
    //   type: "metaContract",
    //   codehash: mvcFtData.codeHash,
    //   genesis: mvcFtData.genesis,
    // });
    // if (!ImageUrl) {
    //   ImageUrl = "1";
    // }
    const metaData = mrc20Data.metaData;
    // const showBalance =
    //   parseFloat(mrc20Data.unsafeBalance) + parseFloat(mrc20Data.balance);

    let showBalance = "0";
    // const showBalance =
    //   parseFloat(item.unsafeBalance) + parseFloat(item.balance);

    if (parseFloat(mrc20Data.balance) > 0) {
      showBalance = removeTrailingZeros2(
        parseFloat(mrc20Data.unsafeBalance) + parseFloat(mrc20Data.balance),
        mrc20Data.decimals
      );
    } else {
      showBalance = removeTrailingZeros2(
        parseFloat(mrc20Data.unsafeBalance),
        mrc20Data.decimals
      );
    }

    let mrc20Img = "";
    if (
      metaData &&
      metaData != null &&
      metaData != undefined &&
      metaData != "" &&
      metaData != "undefined" &&
      JSON.stringify(metaData).includes("icon")
    ) {
      // console.log("metaData", metaData);

      const metaDataObject = JSON.parse(metaData);

      const startIndex = metaData.indexOf("metafile://") + "metafile://".length;
      const endIndex = metaData.indexOf('"', startIndex);
      const extractedString = metaData.substring(startIndex, endIndex);

      // if (netWork === "mainnet") {
      //   mrc20Img = "https://man.metaid.io/content/" + extractedString;
      // } else {
      //   mrc20Img = "https://man-test.metaid.io/content/" + extractedString;
      // }

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

      // console.log("mrc20Img", mrc20Img);
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
    // console.log(mrc20Img);

    return (
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
          marginBottom: 20,
          marginHorizontal: 10,
        }}
      >
        {/* {mvcFtData.imageError ? (
          <CircleAvatarLetter letterStr={mvcFtData.tokenName.substring(0, 1)} />
        ) : (
          <CircleAvatar
            imageUrl={ImageUrl}
            event={() => {
              // refreshData(mvcFtData.txid);
            }}
          />
        )} */}

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
            marginTop: 20,
            fontSize: mrc20Data.tick.length > 10 ? 20 : 25,
            fontWeight: "bold",
            lineHeight: 30,
          }}
        >
          {/* {formatToDecimal(mrc20Data.balance, mrc20Data.decimals)}{" "} */}
          {showBalance} {mrc20Data.tick.length > 10 ? "\n" : ""}
          {mrc20Data.tick.toUpperCase()}
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
          {walletMode != wallet_mode_observer && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigate("SendMrc20Page", {
                  mrc20Data: mrc20Data,
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
          )}

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

        <View
          style={{
            flexDirection: "row",
            marginTop: 15,
            alignItems: "center",

            marginHorizontal: 20,
          }}
        >
          <Text style={{ color: "#666", fontSize: 16 }}>Token ID</Text>
          <View style={{ flex: 1 }} />
        </View>
        <TouchableWithoutFeedback
          onPress={() => {
            ShowNotice(mrc20Data.mrc20Id);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginTop: 5,
              alignItems: "center",
              marginHorizontal: 20,
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={{
                color: "#999",
                fontSize: 14,
                width: "40%",
              }}
            >
              {mrc20Data.mrc20Id}
            </Text>
            <Image
              source={require("../../../image/meta_copy_icon.png")}
              style={{ width: 18, height: 18 }}
            />
            <View style={{ flex: 1 }} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const listHeaderComponent = <View>{ListHeader()}</View>;

  //   const listHeaderComponent = mvcActivityList.length === 0 ? ListHeader() : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

      <View style={{ flex: 1 }}>
        {/* 头部 */}
        {/* <View
          style={{
            flexDirection: "row",
            marginLeft: 20,
            marginTop: 5,
            height: 44,
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              goBack();
            }}
          >
            <Image
              source={require("../../../image/meta_back_icon.png")}
              style={{ width: 22, height: 22 }}
            />
          </TouchableWithoutFeedback>
          <Text
            style={[
              {
                textAlign: "center",
                marginRight: 40,
                marginLeft: 15,
                flex: 1,
                color: "#333333",
                fontSize: 18,
                fontWeight: "bold",
              },
            ]}
          ></Text>

          {myCoinType == "BTC" && (
            <TouchableWithoutFeedback onPress={() => {}}>
              <Image
                source={require("../../../image/assert_adress_type_icon.png")}
                style={{ width: 22, height: 22 }}
              />
            </TouchableWithoutFeedback>
          )}
          <Text style={{ marginRight: 20, color: "#333", fontSize: 16 }}>
            {""}
          </Text>
        </View> */}

        <TitleBar />

        {/* <ListHeader /> */}
        {/* 尾部 */}

        <FlatList
          data={mrc20RecordList}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={ListItem}
          ListHeaderComponent={listHeaderComponent}
        />
      </View>
    </SafeAreaView>
  );
}
