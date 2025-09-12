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
import { fetchMvcNftSerList } from "@/api/metaletservice";

export default function MvcNftListPage({ props, route }) {
  const { myObject } = route.params;
  // let [genesisNftList, setGenesisNftList] = useState<MvcGenesisItemBean[]>([]);
  let [genesisNftList, setGenesisNftList] = useState<MvcNftDetail[]>([]);
  const { mvcAddress, updateMvcAddress } = useData();

  let page = 1;
  let pageSize = 30;

  useEffect(() => {
    getNftListData();
  }, []);

  async function getNftListData() {
  
    try {
      // const value=await AsyncStorage.getItem('@FlutterSharedPreferences:data');
      // console.log('读取的flutter数据信息',value);
      // const filePath = RNFS.DocumentDirectoryPath + "/data.json";
      // const defaultPath = (Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath) + '/data';
      // // 读取文件内容
      // const fileContent = await RNFS.readFile(filePath);
      // // 解析 JSON 数据
      // const jsonData = JSON.parse(fileContent);
      // console.log("读取的数据信息", jsonData);

      // let params = {
      //   page: page,
      //   pageSize: pageSize,
      //   chain: "mvc",
      //   codehash: myObject.codehash,
      //   genesis: myObject.genesis,
      // };
  
      // let url =
      //   BASE_METALET_URL +
      //   "/aggregation/v2/app/show/nft/" +
      //   mvcAddress +
      //   "/details";
  
      // let data: RootMvcGenesisBeanObject = await get(url, false, params);


      const data=await fetchMvcNftSerList(mvcAddress,myObject.codehash,myObject.genesis);
      // console.log("data",data);
      

      // if (data.data.results.items != null) {
      if (data!= null) {
        setGenesisNftList(data);
      }
  
    } catch (e) {
      console.log("读取数据信息错误", e);
    }
  }

  const DetailItmeList = ({ index, item }) => {
    // let imageUrl = getShowImageUrl(item.nftIcon!);
    let imageUrl = getShowImageUrl(item.icon!);
    // console.log("imageUrl",imageUrl)
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("MvcNftDetailPage", { myObject: item });
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
            {/* #{item.nftTokenIndex} */}
            #{item.tokenIndex}
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
