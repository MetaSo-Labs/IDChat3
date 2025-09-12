import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NoMoreDataView } from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
import { BASE_METALET_URL, get } from "../utils/Api";
import { List } from "react-native-paper";
import {
  MvcGenesisItem,
  MvcNftDetailItemList,
  RootMvcNftObject,
} from "../bean/MvcNftBean";
import { getShowImageUrl } from "../utils/MetaFunUiils";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "../hooks/MyProvider";
import { eventBus, refreshMvcFtEvent } from "../utils/EventBus";
import { getCurrentMvcWallet } from "../wallet/wallet";
import {
  getStorageCurrentWallet,
  isObserverWalletMode,
} from "@/utils/WalletUtils";
import { wallet_mode_cold } from "@/utils/AsyncStorageUtil";
import { MvcNftListObject } from "@/api/type/MvcNftData";
import { fetchMvcNftBalance } from "@/api/metaletservice";
export default function MvcNftPage(props) {
  // let [nftList, setNftList] = useState<MvcGenesisItem[]>([]);
  let [nftList, setNftList] = useState<MvcNftListObject[]>([]);
  const { walletManager, updateWalletManager } = useData();
  const { accountIndex, updateAccountIndex } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { walletMode, updateWalletMode } = useData();
  const [cursor, setCursor] = useState(0);
  let pageSize = 5;

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    refresh();
  }, [mvcAddress]);

  async function refresh() {
    // if (mvcAddress) {
    // getMvcNft(mvcAddress);
    // } else {
    // if (walletMode == wallet_mode_cold) {
    const isCold = await isObserverWalletMode();
    if (isCold) {
      const wallet = await getStorageCurrentWallet();
      getMvcNft(wallet.coldAddress, true);
    } else {
      const mvcWallet = await getCurrentMvcWallet();
      getMvcNft(mvcWallet.getAddress(), true);
    }
    // }
  }

  async function loadMore() {
    // if (mvcAddress) {
    // getMvcNft(mvcAddress);
    // } else {
    // if (walletMode == wallet_mode_cold) {
    const isCold = await isObserverWalletMode();

    if (isCold) {
      const wallet = await getStorageCurrentWallet();
      getMvcNft(wallet.coldAddress);
    } else {
      const mvcWallet = await getCurrentMvcWallet();
      getMvcNft(mvcWallet.getAddress());
    }
    // }
  }

  useFocusEffect(
    React.useCallback(() => {
      //  console.log("MvcNftPage  useFocusEffect :"+mvcAddress);
      refresh();
      // nftList.splice(2,1)
      // setNftList([...nftList])
    }, [])
  );

  async function getMvcNft(address: string, isRefresh: boolean = false) {
    //  const nftList=await fetchMvcNftBalance(address);
    //  console.log("nftList",nftList);

    try {
      //   let params = {
      //     page: 1,
      //     pageSize: 300,
      //     chain: "mvc",
      //   };
      //   let data: RootMvcNftObject = await get(
      //     BASE_METALET_URL + "/aggregation/v2/app/show/nft/" + address + "/summary",
      //     false,
      //     params
      //   );

      // console.log("data 获取的NFT 数据： ", JSON.stringify(data));
      // if (isRefresh == false) {
      // }

      const data: MvcNftListObject[] = await fetchMvcNftBalance(
        address,
        cursor
      );

      // console.log("data 获取的NFT 数据： ", JSON.stringify(data));
      // if (data.data.results.items !==undefined&&data.data.results.items != null) {
      if (data !== undefined && data != null && data.length > 0) {
        // setNftList(data.data.results.items);
        // console.log("有数据刷新");
        // setNftList(data);
        if (isRefresh) {
          // console.log("isRefresh", isRefresh);
          setNftList(data);
          setCursor(5);
        } else {
          setNftList((prevList) => [...prevList, ...data]);
          setCursor(cursor + 5);
        }
        // console.log("data", data);

        // setBtcFtList([...data.data.list]);
      } else {
        // console.log('无有数据刷新');
        if (isRefresh) {
          setNftList([]);
        }
        //
      }
    } catch (e) {
      console.log("getMvcNft error ", e);
    }
  }

  const ListItem = ({ index, item }) => {
    const DetailItmeList = ({ index, item }) => {
      // let imageUrl = getShowImageUrl(item.nftIcon!);
      let imageUrl = getShowImageUrl(item.icon!);
      // console.log("imageUrl",imageUrl)
      return (
        <View style={styles.itemStyle}>
          <Image source={{ uri: imageUrl }} style={styles.detailItemStyle} />
          <Text
            style={{
              marginTop: 10,
              color: "#000",
              textAlign: "center",
              fontSize: 12,
            }}
          >
            {/* #{item.nftTokenIndex} */}#{item.tokenIndex}
          </Text>
          <Text
            style={{
              marginTop: 5,
              marginBottom: 5,
              color: "#666",
              fontSize: 13,
            }}
          >
            {/* {item.nftName!} */}
            {item.name!}
          </Text>
        </View>
      );
    };

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          console.log(mvcAddress);
          props.navigation.navigate("MvcNftListPage", {
            myObject: {
              // codehash: item.nftCodehash,
              // genesis: item.nftGenesis,
              codehash: item.codeHash,
              genesis: item.genesis,
            },
          });
        }}
      >
        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: "row" }}>
            <View>
              <Text style={{ color: "#000000", fontSize: 14 }}>
                {/* {item.nftSeriesName!} */}
                {item.seriesName!}
              </Text>
              <Text style={{ color: "#666666", fontSize: 12, marginTop: 5 }}>
                {/* Amount {item.nftMyCount.toString()} */}
                Amount {item.count}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Image
              source={require("../../image/list_icon_ins.png")}
              style={{ width: 10, height: 10 }}
            />
          </View>

          <FlatList
            // data={item.nftDetailItemList}
            data={item.nftList}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={DetailItmeList}
            numColumns={3}
            //  columnWrapperStyle={{justifyContent:'space-between'}}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {nftList == null ||
        (nftList.length == 0 && (
          <TouchableWithoutFeedback>
            <NoMoreDataView />
          </TouchableWithoutFeedback>
        ))}

      {nftList != null && (
        <View>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={nftList}
            showsVerticalScrollIndicator={false}
            renderItem={ListItem}
            refreshing={false}
            onRefresh={() => {
              getMvcNft(mvcAddress, true);
            }}
            onEndReached={loadMore}
          />
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  itemStyle: {
    // backgroundColor:'#171AFF',
    borderRadius: 8,
    height: "auto",
    width: width / 4,
    marginTop: 10,

    alignItems: "center",
    marginRight: 10,
  },
  detailItemStyle: {
    width: width / 4,
    height: width / 4,
    borderRadius: 10,
  },
});
