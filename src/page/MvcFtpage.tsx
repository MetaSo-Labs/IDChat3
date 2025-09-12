import {
  View,
  Text,
  LogBox,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  CircleAvatar,
  CircleAvatarLetter,
  GradientAvatar,
  NoMoreDataView,
} from "../constant/Widget";
import { metaStyles } from "../constant/Constants";
import { useData } from "../hooks/MyProvider";
import { MvcFtBeans, RootObject } from "../bean/DataBean";
import { List } from "react-native-paper";
import { removeTrailingZeros } from "../utils/StringUtils";
import { checkImage, getShowImageUrl } from "../utils/MetaFunUiils";
import { useFocusEffect } from "@react-navigation/native";
import { EventBus, eventBus, refreshMvcFtEvent } from "../utils/EventBus";
import { fetchMvcFtBalance, fetchMvcFtPrice } from "../api/metaletservice";
import { MvcFtData } from "../api/type/MvcFtData";
import { getIconUri } from "@mvc-org/mvc-resources";
import { getCurrentMvcWallet } from "../wallet/wallet";
import {
  formatToDecimal,
  getStorageCurrentWallet,
  isObserverWalletMode,
} from "../utils/WalletUtils";
import { caculateOneFtValue } from "../utils/AssertUtils";
import { navigate } from "../base/NavigationService";
import { wallet_mode_cold } from "@/utils/AsyncStorageUtil";

export default function MvcFtPage() {
  const { userData, updateUserData } = useData();
  const { walletManager, updateWalletManager } = useData();
  const { accountIndex, updateAccountIndex } = useData();

  let [ftList, setftList] = useState<MvcFtData[]>();
  const { metaletWallet, updateMetaletWallet } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { walletMode, updateWalletMode } = useData();

  // let mvcAddress;
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    refresh();
  }, [mvcAddress]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("MvcFtPage  useFocusEffect :" + mvcAddress);
      refresh();
    }, [])
  );

  async function refresh() {
    // if (mvcAddress) {
      // getMvcFtData(mvcAddress);
    // } else {
      // if (walletMode == wallet_mode_cold) {
      const isCold = await isObserverWalletMode();
      if (isCold) {
        const wallet = await getStorageCurrentWallet();
        getMvcFtData(wallet.coldAddress);
      } else {
        const mvcWallet = await getCurrentMvcWallet();
        getMvcFtData(mvcWallet.getAddress());
      }
    // }
  }

  async function getMvcFtData(address: string) {

    const ftdata = await fetchMvcFtBalance(address);
    const ftPriceData = await fetchMvcFtPrice();
    
    

    let list = [];
    if (ftdata != null) {
      for (let i = 0; i < ftdata.length; i++) {
        const ftItem: MvcFtData = ftdata[i];
        const assertFt = caculateOneFtValue([ftItem], ftPriceData);
          ftItem.assetPrice = assertFt;
          // console.log("ftItem.assetPrice",ftItem.assetPrice);
          list.push(ftItem);
       
      }
  
    }
   
    // console.log(ftdata);

    if (list) {
      setftList([...list]);
    } else {
      setftList([]);
    }

    // let param = {
    //   page: 1,
    //   pageSize: 30,
    //   chain: "mvc",
    // };
    // let data: RootObject = await get(
    //   BASE_METALET_URL +
    //     "/aggregation/v2/app/show/ft/" +
    //     address +
    //     "/summaries",
    //   false,
    //   param
    // );
    // //可以设置任何对象到全局变量
    // // updateUserData(data);
    // if (data.data.results.items != null) {
    //   // console.log("data.data.results.items", data.data.results.items);
    //   setftList([...data.data.results.items]);
    // } else {
    //   setftList([]);
    // }
  }

  const [data, setData] = useState([]);

  const refreshData = (id) => {
    setftList((prevList) =>
      prevList.map((item) =>
        item.name === id ? { ...item, imageError: true } : item
      )
    );
  };

  const ListItem = ({ index, item }) => {
    // let ImageUrl = getShowImageUrl(item.icon!);
    let ImageUrl = getIconUri({
      type: "metaContract",
      codehash: item.codeHash,
      genesis: item.genesis,
    });
    if (!ImageUrl) {
      ImageUrl = "1";
    }

    //  const resut=await checkImage(ImageUrl)
    //  setICanLoadImage(resut)
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          console.log(mvcAddress);
          navigate("AssetsMvcFtDetailPage", {
            mvcFtData: item,
          });
        }}
      >
        <View style={styles.flatListStyle}>
          {item.imageError ? (
            <CircleAvatarLetter letterStr={item.name.substring(0, 1)} />
          ) : (
            <CircleAvatar
              imageUrl={ImageUrl}
              event={() => {
                refreshData(item.name);
              }}
            />
          )}
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, color: "#000000", marginBottom: 10 }}>
              {item.symbol.toUpperCase()}
            </Text>
            {/* <Text style={metaStyles.grayTextSmall66}>{item.name}</Text> */}
         
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(23, 26, 255, 0.1)",
                padding: 5,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                width: 70,
              }}
            >
              <Text
                style={{
                  color: "#171AFF",
                  fontSize: 8,
                  textAlign: "center",
                }}
              >
                MetaContract
              </Text>
            </View>
          </View>

          {/* <View style={{ flex: 1 }} /> */}
          <View style={{ marginLeft: 10, marginRight: 10,flex:1 }}>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                fontSize: 16,
                color: "#000000",
                marginBottom: 10,
                textAlign: "right",
              }}
            >
              {formatToDecimal(item.confirmed + item.unconfirmed, item.decimal)}
              {/* {removeTrailingZeros(item.balance)} */}
            </Text>
            <Text style={[metaStyles.grayTextSmall66, { textAlign: "right" }]}>
              ${item.assetPrice}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      {ftList == null || (ftList.length == 0 && <TouchableWithoutFeedback onPress={()=>{
        console.log(mvcAddress);
        
      }}>
        <View style={{flex:1}}>
          <TouchableWithoutFeedback onPress={()=>{
            console.log(mvcAddress);
          }}>
            <Text> </Text>
          </TouchableWithoutFeedback>
        <NoMoreDataView />
        </View>
      
      </TouchableWithoutFeedback>)}
      {/* {hasData && userData!=null &&<Text>名称： {ftList[0]}  年龄：{11}</Text>} */}
      {ftList != null && (
        <View>
          <FlatList
            data={ftList}
            renderItem={ListItem}
            keyExtractor={(item, index) => item.name}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flatListStyle: {
    width: "100%",
    height: 100,
    backgroundColor: "#F5F7F9",
    marginTop: 10,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
});
