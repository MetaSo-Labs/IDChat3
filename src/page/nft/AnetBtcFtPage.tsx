import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  CircleAvatar,
  CircleAvatarLetter,
  NoMoreDataView,
} from "../../constant/Widget";
import { metaStyles } from "../../constant/Constants";
import { BtcFtBean, RootBtcFtObject } from "../../bean/BtcFtBean";
import { BTC_FT_URL, get } from "../../utils/Api";
import { useData } from "../../hooks/MyProvider";
import { useFocusEffect } from "@react-navigation/native";
import { eventBus, refreshBtcFtEvent } from "../../utils/EventBus";

export default function AnetBtcFtPage() {
  let [btcFtList, setBtcFtList] = useState<BtcFtBean[]>([]);
  const { walletManager, updateWalletManager } = useData();
  const { accountIndex, updateAccountIndex } = useData();

  const { metaletWallet, updateMetaletWallet } = useData();
  const { btcAddress, updateBtcAddress } = useData();
  const { netWork, updateNetWork } = useData();

  // const isFocused = useIsFocused(); // 使用useIsFocused钩子

  useEffect(() => {
    console.log("btc page laod 页面初始化加载中");
    getBtcFtData(btcAddress);
  }, []);

  // useEffect(() => {
  //   console.log('地址变化加载中 ',{ btcAddress });

  //   getBtcFtData(btcAddress);
  // }, [btcAddress]);

  // useFocusEffect(
  //   useCallback(() => {
  //     getBtcFtData(btcAddress);
  //   }, [])
  // );

  const getBtcFtData = async (address: string) => {
    let params = {
      net: "mainnet",
      // address: metaletWallet.currentBtcWallet.getAddress(),
      address: address,
      ticker: "btc",
      cursor: 0,
      size: 10000,
    };

    let data: RootBtcFtObject = await get(BTC_FT_URL, false, params);
    if (data.data != null) {
      if (data.data.list != null) {
        setBtcFtList([...data.data.list]);
      } else {
        setBtcFtList([]);
      }
    } else {
      setBtcFtList([]);
    }
  };

  const ListItem = ({ index, item }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          console.log("点击了" + index);
        }}
      >
        <View style={styles.flatListStyle}>
          <CircleAvatarLetter letterStr={item.ticker.substring(0, 1)} />

          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, color: "#000000", marginBottom: 10 }}>
              {item.ticker.toUpperCase()}
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
            <Text style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}>
              - - - - - - - - - -{" "}
            </Text>
            <Text style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}>
              Transferable:{" "}
            </Text>
            <Text style={[metaStyles.defaultText, { textAlign: "right" }]}>
              {item.transferableBalance!}{" "}
            </Text>
            <Text style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}>
              Available:{" "}
            </Text>
            <Text style={[metaStyles.defaultText, { textAlign: "right" }]}>
              {item.availableBalance!}{" "}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {/* <TouchableWithoutFeedback onPress={()=>{
      console.log(JSON.stringify(btcFtList));
     }}>
      <Text>  {netWork}</Text>
     </TouchableWithoutFeedback> */}

      {btcFtList.length == 0 ? (
        <NoMoreDataView />
      ) : (
        <FlatList
          data={btcFtList}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={ListItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flatListStyle: {
    width: "100%",
    height: "auto",
    backgroundColor: "#F5F7F9",
    marginTop: 10,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
