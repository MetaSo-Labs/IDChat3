import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
  ListRenderItem,
  SafeAreaView,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleAvatar,
  CircleAvatarLetter,
  LoadingModal,
  NoMoreDataView,
} from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
import { BtcFtBean, RootBtcFtObject } from "../bean/BtcFtBean";
import { BTC_FT_URL, get } from "../utils/Api";
import { useData } from "../hooks/MyProvider";
import { useFocusEffect } from "@react-navigation/native";
import { eventBus, refreshBtcFtEvent } from "../utils/EventBus";
import { getCurrentBtcWallet } from "../wallet/wallet";
import { navigate } from "@/base/NavigationService";
import {
  getStorageCurrentWallet,
  getWalletNetwork,
  isObserverWalletMode,
} from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";
import {
  fetchAssetsPrice,
  fetchMrc20List,
  fetchMrc20Price,
} from "@/api/metaletservice";
import { useMRC20sInfiniteQuery } from "@/queries/mrc20";
import { lightGreen100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import { removeTrailingZeros, removeTrailingZeros2 } from "@/utils/StringUtils";
import useNetworkStore from "@/stores/useNetworkStore";
import { caculateOneBtcFtMrc20Value } from "@/utils/AssertUtils";
import { use } from "i18next";
import { useTranslation } from "react-i18next";

// now
export default function BtcFtPage() {
  let [btcFtList, setBtcFtList] = useState([]);
  const { walletManager, updateWalletManager } = useData();
  const { accountIndex, updateAccountIndex } = useData();

  const { metaletWallet, updateMetaletWallet } = useData();
  const { btcAddress, updateBtcAddress } = useData();
  // const { netWork, updateNetWork } = useData();
  const { network, switchNetwork } = useNetworkStore();

  const [isShowLoading, setIsShowLoading] = useState(false);
  const { t } = useTranslation();

  // const isFocused = useIsFocused(); // 使用useIsFocused钩子
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    refresh();
  }, [btcAddress]);

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect  BtcFtPage", { btcAddress });
      refresh();
    }, [btcAddress])
  );

  const { data: _mrc20Assets } = useMRC20sInfiniteQuery(btcAddress, 1000000, {
    enabled: !!btcAddress,
  });

  const mrc20Assets = useMemo(
    () => (_mrc20Assets ? _mrc20Assets.pages.flatMap((page) => page.list) : []),
    [_mrc20Assets]
  );

  useEffect(() => {
    if (mrc20Assets.length) {
      // console.log("Mrc20-----1 ", JSON.stringify(mrc20Assets));
    }
  }, [mrc20Assets]);

  async function refresh() {
    // setIsShowLoading(true);
    if (btcAddress) {
      getBtcFtData(btcAddress);
    } else {
      const isCold = await isObserverWalletMode();
      if (isCold) {
        const wallet = await getStorageCurrentWallet();
        getBtcFtData(wallet.coldAddress);
      } else {
        const mvcWallet = await getCurrentBtcWallet();
        getBtcFtData(mvcWallet.getAddress());
      }
    }
  }

  const getBtcFtData = async (address: string) => {
    const network = await getWalletNetwork(Chain.BTC);

    let list = [];
    const simData = await fetchMrc20List(network, address);
    setIsShowLoading(false);

    //price
    const ftPriceData = await fetchMrc20Price();
    // console.log("ftPriceData", JSON.stringify(ftPriceData));
    
    const assertPrice = await fetchAssetsPrice();
    const btcPrice = assertPrice.data.priceInfo.btc;

    // console.log("simData", JSON.stringify(simData));
    if (simData && simData.data) {
      if (simData.data!.list != null && simData.data!.list.length > 0) {
        simData.data.list.forEach((item) => {
          if (item) {
            item.type = "mrc20";
            item.tokenName = item.tick;
            const assertFt = caculateOneBtcFtMrc20Value(
              [item],
              ftPriceData,
              btcPrice
            );
            item.assetPrice = assertFt;
            list.push(item);
          }
        });
      }
    }
    let params = {
      net: network,
      // address: metaletWallet.currentBtcWallet.getAddress(),
      address: address,
      ticker: "btc",
      cursor: 0,
      size: 10000,
    };

    let dataBrc20: RootBtcFtObject = await get(BTC_FT_URL, false, params);
    // console.log("dataBrc20", JSON.stringify(dataBrc20));

    if (dataBrc20 && dataBrc20.data) {
      if (dataBrc20.data.list != null && dataBrc20.data.list.length > 0) {
        dataBrc20.data.list.forEach((item) => {
          if (item) {
            item.type = "brc20";
            list.push(item);
          }
        });
      }
    }

    // console.log("list", JSON.stringify(list));

    if (list != null && list.length > 0) {
      setBtcFtList([...list]);
    } else {
      setBtcFtList([]);
    }

    // if (data.data != null) {
    //   if (data.data.list != null) {
    //     setBtcFtList([...data.data.list]);
    //   } else {
    //     setBtcFtList([]);
    //   }
    // } else {
    //   setBtcFtList([]);
    // }
  };

  const ListItem: React.FC<{ index: number; item }> = ({ index, item }) => {
    if (item.type === "brc20") {
      return (
        <TouchableWithoutFeedback
          onPress={() => {
            navigate("BRC20DetailPage", {
              brc20: item,
            });
          }}
        >
          <View style={styles.flatListStyle}>
            <CircleAvatarLetter letterStr={item.ticker.substring(0, 1)} />

            <View style={{ marginLeft: 10 }}>
              <Text
                style={{ fontSize: 16, color: "#000000", marginBottom: 10 }}
              >
                {item.ticker.toUpperCase()}
                {/* {item.ticker} */}
              </Text>

              <View
                style={{
                  backgroundColor: "rgba(247, 147, 26, 0.2)",
                  borderRadius: 3,
                  padding: 5,
                }}
              >
                <Text style={{ fontSize: 10, color: "#FF981C" }}>BRC20</Text>
              </View>
            </View>

            <View style={{ flex: 1 }} />

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontSize: 16, color: "#000000", textAlign: "right" }}
              >
                {item.overallBalance!}
              </Text>
              <Text
                style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}
              >
                - - - - - - - - - -{" "}
              </Text>
              <Text
                style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}
              >
                {t("b_transferable")}:
              </Text>
              <Text style={[metaStyles.defaultText, { textAlign: "right" }]}>
                {item.transferableBalance!}{" "}
              </Text>
              <Text
                style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}
              >
                {t("b_available")}:
              </Text>
              <Text style={[metaStyles.defaultText, { textAlign: "right" }]}>
                {item.availableBalance!}{" "}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      let showBalance = "0";
      // const showBalance =
      //   parseFloat(item.unsafeBalance) + parseFloat(item.balance);

      if (parseFloat(item.balance) > 0) {
        // let balance=parseFloat(item.unsafeBalance) + parseFloat(item.balance);
        // const formattedNum = balance.toFixed(item.decimals);
        // showBalance = formattedNum.replace(/\.?0+$/, '');
        // showBalance = parseFloat((parseFloat(item.unsafeBalance) + parseFloat(item.balance)).toFixed(item.decimals));

        showBalance = removeTrailingZeros2(
          parseFloat(item.unsafeBalance) + parseFloat(item.balance),
          item.decimals
        );
      } else {
        // showBalance = parseFloat(item.unsafeBalance).toFixed(item.decimals);
        showBalance = removeTrailingZeros2(item.unsafeBalance, item.decimals);
      }

      let showUnConfirmed = false;
      if (parseFloat(item.unsafeBalance) > 0) {
        // if (parseFloat(item.unsafeBalance) <= 0) {
        showUnConfirmed = true;
      } else {
        showUnConfirmed = false;
      }
      let mrc20Img;
      const metaData = item.metaData;

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
        // console.log("metaDataObject icon", metaDataObject.icon);
        const startIndex =
          metaData.indexOf("metafile://") + "metafile://".length;
        const endIndex = metaData.indexOf('"', startIndex);
        const extractedString = metaData.substring(startIndex, endIndex);

        // console.log("netWork",network);

        if (network === "mainnet") {
          if (metaDataObject.icon.startsWith("http")) {
            mrc20Img = metaDataObject.icon;
          } else {
            mrc20Img = "https://man.metaid.io/content/" + extractedString;
          }
        } else {
          if (
            metaDataObject.icon != undefined &&
            metaDataObject.icon.startsWith("http")
          ) {
            mrc20Img = metaDataObject.icon;
          } else {
            mrc20Img = "https://man-test.metaid.io/content/" + extractedString;
          }
        }
      }

      if (item.tag && mrc20Img == undefined) {
        if (item.tag === "id-coins") {
          if (
            item.deployUserInfo.avatar &&
            item.deployUserInfo.avatar.trim() != ""
          ) {
            mrc20Img = item.deployUserInfo.avatar;
          } else {
            mrc20Img = "";
          }
        }
      }
      // console.log(mrc20Img);

      return (
        <TouchableWithoutFeedback
          onPress={() => {
            navigate("Mrc20DetailPage", {
              mrc20Data: item,
            });
          }}
        >
          <View
            style={{
              backgroundColor: "#F5F7F9",
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            <View
              style={[
                styles.flatListStyle,
                { paddingTop: 20, paddingBottom: 20 },
              ]}
            >
              {mrc20Img != null &&
              mrc20Img != undefined &&
              mrc20Img != "undefined" &&
              mrc20Img != "null" &&
              mrc20Img != "" ? (
                <CircleAvatar
                  imageUrl={mrc20Img}
                  event={() => {
                    // refreshData(item.name);
                  }}
                />
              ) : (
                <CircleAvatarLetter
                  letterStr={item.tick.trim().substring(0, 1)}
                />
              )}

              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontSize: item.tokenName.length > 10 ? 10 : 16,
                    color: "#000000",
                    marginBottom: 10,
                    width: 100,
                  }}
                >
                  {item.tokenName.toUpperCase()}
                  {/* {item.tokenName} */}
                </Text>

                <View
                  style={{
                    backgroundColor: "rgba(214, 240, 255, 0.5)",
                    borderRadius: 3,
                    padding: 5,
                    width: 50,
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#1472FF" }}>MRC20</Text>
                </View>
              </View>

              {/* <View style={{ flex: 1 }} /> */}

              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[metaStyles.defaultText, { textAlign: "right" }]}
                >
                  {/* {item.balance!}{" "} */}
                  {showBalance}
                </Text>

                <Text
                  style={[
                    metaStyles.grayTextSmall66,
                    { textAlign: "right", marginTop: 5 },
                  ]}
                >
                  ${item.assetPrice}
                </Text>
              </View>
            </View>

            {showUnConfirmed && (
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  padding: 10,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  marginHorizontal: 10,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={[metaStyles.smallDefaultText, {}]}>
                    {item.balance}
                  </Text>
                  <Text style={[metaStyles.grayTextSmall66, { marginTop: 5 }]}>
                    {" "}
                    Confirmed
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={[metaStyles.smallDefaultText, {}]}>
                    {item.unsafeAmount}
                  </Text>
                  <Text style={[metaStyles.grayTextSmall66, { marginTop: 5 }]}>
                    {" "}
                    Unconfirmed
                  </Text>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    }
  };

  // 定义 renderItem 函数
  const renderItem: ListRenderItem<BtcFtBean> = ({ item, index }) => {
    return <ListItem item={item} index={index} />;
  };

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {btcFtList.length == 0 ? (
        <NoMoreDataView />
      ) : (
        <SafeAreaView>
          <LoadingModal
            isShow={isShowLoading}
            isCancel={true}
            event={() => {
              setIsShowLoading(false);
            }}
          />
          <FlatList
            data={btcFtList}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flatListStyle: {
    width: "100%",
    height: "auto",
    // backgroundColor: "#F5F7F9",
    marginTop: 10,
    // borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
