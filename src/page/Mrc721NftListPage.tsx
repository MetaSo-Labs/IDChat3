import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BASE_METALET_URL, get } from "../utils/Api";
import {
  MvcGenesisItemBean,
  RootMvcGenesisBeanObject,
} from "../bean/MvcGenesisBean";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitleBar } from "../constant/Widget";
import { getShowImageUrl } from "../utils/MetaFunUiils";
import { navigate } from "../base/NavigationService";
import { useData } from "@/hooks/MyProvider";
import { MvcNftDetail } from "@/api/type/MvcNftData";
import { fetchMRC721ItemList, fetchMvcNftSerList } from "@/api/metaletservice";
import { getWalletNetwork } from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";

export default function Mrc721NftListPage({ props, route }) {
  const { myObject } = route.params;
  // let [genesisNftList, setGenesisNftList] = useState<MvcGenesisItemBean[]>([]);
  let [genesisNftList, setGenesisNftList] = useState<Mrc721ItemBean[]>([]);
  // const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  let page = 1;
  let pageSize = 30;

  useEffect(() => {
    getNftListData();
  }, []);

  async function getNftListData() {
  
    try {

      // const data=await fetchMvcNftSerList(mvcAddress,myObject.codehash,myObject.genesis);
      console.log("myObject",myObject);
      
      const mrcItemListList=await fetchMRC721ItemList(btcAddress, myObject.pinID, 10000);
      // console.log("data",data);
      for (let i = 0; i < mrcItemListList.length; i++) {
        let nftData: Mrc721ItemBean = mrcItemListList[i];
        const content = extractMetafileValue(nftData.contentString);
        // console.log("content",content);
        const imageUrl = await getImageUrl(content);
        // console.log("imageUrl", imageUrl);
        nftData.showImage = imageUrl;
      }

      // if (data.data.results.items != null) {
      if (mrcItemListList!= null) {
        setGenesisNftList(mrcItemListList);
      }
  
    } catch (e) {
      console.log("读取数据信息错误", e);
    }
  }

  async function getImageUrl(url: string) {
    try {
      const network = await getWalletNetwork(Chain.BTC);
      if (network === "testnet") {
        return "https://man-test.metaid.io/content/" + url;
      } else {
        return "https://man.metaid.io/content/" + url;
      }
    } catch (error) {
      console.error("Error fetching content summary:", error);
    }
  }

    // 提取 metafile:// 后的值
    function extractMetafileValue(contentString: string): string | null {
      const match = contentString.match(/metafile:\/\/([\w\d]+)/);
      return match ? match[1] : null;
    }
  const DetailItmeList = ({ index, item }) => {
    // let imageUrl = getShowImageUrl(item.nftIcon!);
    // let imageUrl = getShowImageUrl(item.icon!);
    let imageUrl =item.showImage;
    // console.log("imageUrl",imageUrl)
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("BtcNftMRC721DetailPage", { nftDetail: item });
        }}
      >
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
            #{item.itemPinNumber}
            {/* #{item.itemPinId.toString().substring(0,8)} */}
          </Text>
          <Text
            style={{
              marginTop: 5,
              marginBottom: 5,
              color: "#666",
              fontSize: 13,
            }}
          >
            {item.name!}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TitleBar />
      <View style={{ justifyContent: "center" }}>
        <View style={{ flexDirection: "row" }}>
          {/* <View style={{flex:1}}/> */}
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={genesisNftList}
            renderItem={DetailItmeList}
            numColumns={3}
            style={{ marginLeft: 20 }}
          />
          <View style={{ flex: 1 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  itemStyle: {
    // backgroundColor:'#171AFF',
    borderRadius: 8,
    height: "auto",
    width: width / 3.5,
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
