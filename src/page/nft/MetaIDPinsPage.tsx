import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { NoMoreDataView } from "../../constant/Widget";
import {
  grayNormalColor,
  inputNormalBgColor,
  litterWhittleBgColor,
  metaStyles,
} from "../../constant/Constants";
import { BtcNftBean, RootBtcNftObject } from "../../bean/BtcNftBean";
import { BTC_NFT_URL, get } from "../../utils/Api";
import { useData } from "../../hooks/MyProvider";
import { MetaletWalletManager } from "../../wallet/MetaletWalletManager";
import { eventBus, refreshBtcFtEvent } from "../../utils/EventBus";
import { useFocusEffect } from "@react-navigation/native";
import { getCurrentBtcWallet } from "../../wallet/wallet";
import { navigate } from "@/base/NavigationService";
import {
  getStorageCurrentWallet,
  getWalletNetwork,
  isObserverWalletMode,
} from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";
import { MetaIDPinsData, Pins } from "@/api/type/MetaIDPinsData";
import { fetchMetaIDPinsList } from "@/api/metaletservice";

// nft
export default function MetaIDPinsPage() {
  let [nftList, setNftList] = useState<Pins[]>([]);
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
    const network = await getWalletNetwork(Chain.BTC);

    const data: MetaIDPinsData = await fetchMetaIDPinsList(network, address);
    // console.log("metaPinsData", data);

    let list = [];
    if (data.data != null) {
      // if (data.data. != null) {
      // for(let i=0;i<data.data.list.length;i++){
      //  let nftData:BtcNftBean=data.data.list[i];
      //  let reslut=await get(nftData.content,true)
      //  nftData.nftShowContent=reslut
      //  list.push(nftData)
      // }
      // const newData=[...list,{id:+1}]
      // setNftList(newData)
      // setNftList([...list])

      //re
      // setNftList([...data.data.list])

      for (let i = 0; i < 20; i++) {
        let nftData: Pins = data.data[0];
        //  let reslut=await get(nftData.content,true)
        //  nftData.nftShowContent=reslut
        list.push(nftData);
      }

      if (data.data.length >= 3) {
        setIsmany(10);
      } else {
        setIsmany(0);
      }
      setNftList([...data.data]);
      // } else {
      //   setNftList([]);
      // }
    } else {
      setNftList([]);
    }
  };

  function ItemList({ index, item }) {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("MetaIDPinsDetails", { nftDetail: item });
        }}
      >
        {item.contentTypeDetect.includes("image") ? (
          <View
            style={{
              backgroundColor: item.contentTypeDetect.includes("image")
                ? "#fff"
                : "#171AFF",
              borderRadius: 8,
              height: width / 4,
              width: width / 4,
              marginTop: 10,
              marginRight: 10,
              // paddingHorizontal: 10,
              // paddingVertical: 10,
              // borderBlockColor: "#171AFF",
              borderWidth: 1,
              borderColor: inputNormalBgColor,
            }}
          >
            <ImageBackground
              source={{ uri: item.content }} // 替换为你的图片路径
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
              backgroundColor: item.contentTypeDetect.includes("image")
                ? "#fff"
                : "#171AFF",
              borderRadius: 8,
              height: width / 4,
              width: width / 4,
              marginTop: 10,
              marginRight: 10,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderBlockColor: "#171AFF",
              borderWidth: 1,
              borderColor: inputNormalBgColor,
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {/* <Text style={{color:'#fff',fontSize:10}}>{JSON.stringify(item.nftShowContent)}</Text> */}

                {item.contentTypeDetect.includes("image") ? (
                  // <Image source={{ uri: item.content }} />
                  <Image
                    style={{ width: "100%", height: "100%" }}
                    source={{ uri: item.content }}
                  />
                ) : (
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{ color: "#fff", fontSize: 10, textAlign: "center" }}
                  >
                    {item.contentSummary}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: "row" }}>
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
            </View>
          </View>
        )}
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {nftList == null || (nftList.length == 0 && <NoMoreDataView />)}

      {nftList != null && (
        <View>
          <FlatList
            data={nftList}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={ItemList}
            numColumns={3}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  itemStyle: {},
});
