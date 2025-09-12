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
import { metaStyles, themeColor } from "../../constant/Constants";
import { MvcActivityRecord } from "../../types/mvcrecord";
import { fetchMvcFtPrice, fetchMvcFtRecord } from "../../api/metaletservice";
import { useData } from "../../hooks/MyProvider";
import * as Clipboard from "expo-clipboard";
import { formatTime } from "../../utils/MetaFunUiils";
import { SafeAreaView } from "react-native-safe-area-context";
import { MvcFtRecordData } from "../../api/type/MvcFtData";
import { getIconUri } from "@mvc-org/mvc-resources";
import { formatToDecimal } from "../../utils/WalletUtils";
import { caculateOneFtValue } from "../../utils/AssertUtils";
import { useTranslation } from "react-i18next";
import { wallet_mode_observer } from "@/utils/AsyncStorageUtil";

export default function AssetsMvcFtDetailPage({ route }) {
  const { mvcFtData } = route.params;
  const [mvcActivityList, setMvcActivityList] = useState<MvcFtRecordData[]>([]);
  const { mvcAddress, updateMvcAddress } = useData();
  const [noticeContent, setNoticeContent] = useState("Successful");
  const [isShowNotice, setIsShowNotice] = useState(false);
  const { metaletWallet, updateMetaletWallet } = useData();

  const [assertOneFt, setOneFtAssert] = useState("0.0");
  const { t } = useTranslation();

  const { walletMode, updateWalletMode } = useData();

  useEffect(() => {
    console.log(mvcFtData);

    getActivityList();
  }, []);

  async function getActivityList() {
    const ftPriceData = await fetchMvcFtPrice();
    const assertFt = caculateOneFtValue([mvcFtData], ftPriceData);
    setOneFtAssert(assertFt);

    let mvcActivityListData = await fetchMvcFtRecord(
      mvcAddress,
      mvcFtData.genesis,
      mvcFtData.codeHash
    );
    // console.log(mvcActivityListData);

    if (mvcActivityListData.length == 0) {
      let record: MvcFtRecordData = {
        flag: "1",
        address: "1",
        time: 1712334223000,
        height: 1,
        income: 1,
        outcome: 1,
        txid: "",
        codeHash: "",
        genesis: "",
      };
      setMvcActivityList([...mvcActivityListData, record]);
    } else {
      setMvcActivityList([...mvcActivityListData]);
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
    let recordMoney;
    let showAmount;
    recordMoney = item.income - item.outcome;
    // showAmount = (recordMoney / 100000000).toFixed(8);

    showAmount = formatToDecimal(recordMoney, parseFloat(mvcFtData.decimal));

    if (recordMoney > 0) {
      isIncome = true;
    } else {
      isIncome = false;
    }

    let ImageUrl = getIconUri({
      type: "metaContract",
      codehash: mvcFtData.codeHash,
      genesis: mvcFtData.genesis,
    });

    return (
      <View>
        {item.address != "1" ? (
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
                {/* {mvcFtData.imageError ? (
                  <View>
                    <CircleAvatarLetter
                      letterStr={mvcFtData.name.substring(0, 1)}
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
                  {isIncome ? "Receive" : "Send"}
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
                  {mvcFtData.symbol.toString().toUpperCase()}
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
                    ShowNotice(item.txid);
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Text style={metaStyles.grayTextSmall66}>
                      {/* {formatTime(item.time)} */}
                      {formatTime(item.time * 1000)}
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
                      {item.txid}
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
              {t("o_nodata")}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const ListHeader = () => {
    let ImageUrl = getIconUri({
      type: "metaContract",
      codehash: mvcFtData.codeHash,
      genesis: mvcFtData.genesis,
    });
    if (!ImageUrl) {
      ImageUrl = "1";
    }

    return (
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
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
            marginTop: 20,
            fontSize: 25,
            fontWeight: "bold",
          }}
        >
          {formatToDecimal(
            mvcFtData.confirmed + mvcFtData.unconfirmed,
            mvcFtData.decimal
          )}{" "}
          {mvcFtData.symbol.toUpperCase()}
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
                navigate("SendMvcFtPage", {
                  mvcFtData: mvcFtData,
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
              navigate("ReceivePage", { myCoinType: "SPACE" });
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
