import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ImageBackground,
  SectionList,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { NoMoreDataView } from "../constant/Widget";
import { inputNormalBgColor, metaStyles } from "../constant/Constants";
import { BtcNftBean, RootBtcNftObject } from "../bean/BtcNftBean";
import { BTC_NFT_URL, get } from "../utils/Api";
import { useData } from "../hooks/MyProvider";
import { MetaletWalletManager } from "../wallet/MetaletWalletManager";
import { eventBus, refreshBtcFtEvent } from "../utils/EventBus";
import { useFocusEffect } from "@react-navigation/native";
import { getCurrentBtcWallet } from "../wallet/wallet";
import { navigate } from "@/base/NavigationService";
import {
  getStorageCurrentWallet,
  getWalletNetwork,
  isObserverWalletMode,
} from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";
import { fetchPINsList } from "@/api/metaletservice";
import { PINsBean } from "@/api/type/PINsBean";
import { VIEWPORT_DEFAULT_HOTKEY } from "@tamagui/toast/types/ToastViewport";

// nft
export default function BtcMRC721Page() {
  // let [nftList, setNftList] = useState<PINsBean[]>([]);
  let [nftList, setNftList] = useState([]);

  const { accountIndex, updateAccountIndex } = useData();
  const { metaletWallet, updateMetaletWallet } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  const [ismany, setIsmany] = useState(0);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    refresh();
  }, [btcAddress]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  async function refresh() {
    if (btcAddress) {
      getBtcNftData(btcAddress);
    } else {
      const isCold = await isObserverWalletMode();
      if (isCold) {
        const wallet = await getStorageCurrentWallet();
        getBtcNftData(wallet.coldAddress);
      } else {
        const btcWallet = await getCurrentBtcWallet();
        getBtcNftData(btcWallet.getAddress());
      }
    }
  }

  const getBtcNftData = async (address: string) => {

    // console.log("address", address);
    // console.log("getBtcNftData", btcAddress);
    const resultList: PINsBean[] = await fetchPINsList(address);
    if (resultList.length > 0) {
      // console.log("pins data: "+JSON.stringify(resultList));
      let list = [];
      for (let i = 0; i < resultList.length; i++) {
        let nftData: PINsBean = resultList[i];
        if (
          nftData.path.startsWith("/nft/mrc721") &&
          !nftData.path.includes("/collection_desc")
        ) {
          const imageUrl = await getImageUrl(nftData.content);
          // console.log("imageUrl", imageUrl);
          nftData.showImage = imageUrl;
          list.push(nftData);
        }
      }
      const groupedMetaPins = list.reduce((acc, pin) => {
        (acc[pin.path] ||= []).push(pin);
        return acc;
      }, {});

      // console.log("groupedMetaPins", groupedMetaPins);

      // 转换为 SectionList 格式
      const sections = Object.entries(groupedMetaPins).map(([key, value]) => ({
        title: key.split("/").pop(), // 提取最后部分
        data: value, // 分组数据
      }));

      setNftList([...sections]);
      // console.log("nftList", JSON.stringify(nftList));

      // if (resultList.length >= 3) {
      //   setIsmany(10);
      // } else {
      //   setIsmany(0);
      // }
    } else {
      setNftList([]);
    }
  };

  async function getImageUrl(url: string) {
    try {
      const response = await fetch(url);
      const network = await getWalletNetwork(Chain.BTC);
      if (response.ok) {
        const data = await response.json();
        const contentUrl = data.attachment[0].content.replace(
          "metafile://",
          `https://man${network === "testnet" ? "-test" : ""}.metaid.io/content/`
        );
        return contentUrl;
      } else {
        console.error("Failed to fetch content summary:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching content summary:", error);
    }
  }
  function ItemList({ item }) {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("BtcNftMRC721DetailPage", { nftDetail: item });
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            height: width / 4,
            width: width / 4,
            marginTop: 10,
            marginRight: 10,
            borderWidth: 1,
            borderColor: inputNormalBgColor,
          }}
        >
          <ImageBackground
            source={{ uri: item.showImage }} // 替换为你的图片路径
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
      </TouchableWithoutFeedback>
    );
  }

  const ListItem = ({ item, index }) => {
    console.log(item.length);
    
    return (
      
      <View>
        <View style={{ flexDirection: "row" ,marginTop:10}}>
          <Text>{item.title}</Text>
          <Text>({item.data.length})</Text>
        </View>

        <FlatList
          data={item.data}
          keyExtractor={(item, index) => `${item.title}-${index}`} // 确保每个项有唯一key
          // showsVerticalScrollIndicator={false}
          renderItem={ItemList}
          numColumns={3}
          // scrollEnabled={false}
          // contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
    );
  };

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {nftList == null || (nftList.length == 0 && <NoMoreDataView />)}

      {nftList != null && (
        <View>
          {/* <FlatList
            data={nftList}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={ItemList}
            numColumns={3}
            contentContainerStyle={{ flexGrow: 1 }}
          /> */}

          {/* <SectionList
            sections={nftList}
            keyExtractor={(item, index) => `${item.title}-${index}`} // 确保每个section有唯一key
            renderItem={ListItem}
            renderSectionHeader={({ section }) => (
              <View>
                <Text>
                  {section.title}
                  {section.data.length}
                </Text>
              </View>
            )}
          /> */}

          <FlatList
            data={nftList}
            keyExtractor={(item, index) => `${item.title}-${index}`} // 确保每个section有唯一key
            renderItem={ListItem}
          />
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  itemStyle: {},
  itemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: Dimensions.get("window").width / 3, // 动态宽度，每行 3 列
  },
});
