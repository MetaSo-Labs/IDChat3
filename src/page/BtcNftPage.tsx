import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { NoMoreDataView } from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
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

// nft
export default function BtcNftPage() {
  let [nftList, setNftList] = useState<BtcNftBean[]>([]);
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

    let params = {
      net: network,
      address: address,
      // address:metaletWallet.currentBtcWallet.getAddress(),
      cursor: 0,
      size: 10000,
    };

    let data: RootBtcNftObject = await get(BTC_NFT_URL, false, params);

    let list = [];
    if (data.data != null) {
      if (data.data.list != null) {
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
          let nftData: BtcNftBean = data.data.list[0];
          //  let reslut=await get(nftData.content,true)
          //  nftData.nftShowContent=reslut
          list.push(nftData);
        }

        if (data.data.list.length >= 3) {
          setIsmany(10);
        } else {
          setIsmany(0);
        }
        setNftList([...data.data.list]);
      } else {
        setNftList([]);
      }
    } else {
      setNftList([]);
    }
  };

  function ItemList({ index, item }) {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigate("BtcNftDetailPage", { nftDetail: item });
        }}
      >
        <View
          style={{
            backgroundColor: "#171AFF",
            borderRadius: 8,
            height: "auto",
            width: width / 4,
            marginTop: 10,
            marginRight: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <View>
            {/* <Text style={{color:'#fff',fontSize:10}}>{JSON.stringify(item.nftShowContent)}</Text> */}
            <Text style={{ color: "#fff", fontSize: 10 }}>
              {item.contentBody}
            </Text>
            <View style={{ height: 10 }} />
            <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  width: 50,
                  backgroundColor: "#767EFF",
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
                  {" "}
                  546 sat{" "}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
