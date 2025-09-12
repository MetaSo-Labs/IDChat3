import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { metaStyles } from "../../constant/Constants";
import { goBack, navigate } from "../../base/NavigationService";
import {  wallets_key } from "../../utils/AsyncStorageUtil";
import { AccountsOptions, WalletBean } from "../../bean/WalletBean";
import { GradientAvatar } from "../../constant/Widget";
import { useFocusEffect } from "@react-navigation/native";
import { getStorageWallets } from "../../utils/WalletUtils";

export default function WalletDetailPage({ route }) {
  const [nowWallet, setnowWallet] = useState<WalletBean>();
  let [accountsOptionsList, setAccountsOptionsList] = useState<
    AccountsOptions[]
  >([]);

  const { postion } = route.params;

  async function initWalletData() {
    await getStorageWallets().then((wallets) => {
      // await AsyncStorageUtil.getItem(wallets_key).then((wallets) => {
      const nowWallet = wallets[postion];
      //    let wallet=res.find(item=>item.id==id)
      setnowWallet(nowWallet);
      setAccountsOptionsList(nowWallet.accountsOptions);
    });
  }

  useEffect(() => {
    initWalletData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log("useFocusEffect");
      initWalletData();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          console.log(item);
          navigate("WalletAccountDetailPage", {
            PositionWallet: { walletIndex: postion, accountIndex: index },
          });
          //   updataSelectAccount(parentIndex, index);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginTop: 15,
            flex: 1,
            alignItems: "center",
          }}
        >
          <GradientAvatar
            userStyle={{ width: 36, height: 36 }}
            isRand={true}
            defaultAvatarColor={item.defaultAvatarColor}
          />
          <View style={{ marginLeft: 10 }}>
            <Text>{item.name}</Text>
            {/* <Text style={{ marginTop: 10 }}>{}</Text> */}
          </View>

          <View style={{ flex: 1 }} />

          <Image
            source={require("../../../image/list_icon_ins.png")}
            style={{ padding: 8, width: 15, height: 15 }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* 标题 */}
        <View
          style={{
            flexDirection: "row",
            paddingLeft: 20,
            paddingTop: 5,
            height: 44,
            alignItems: "center",
            backgroundColor: "white",
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

          <View style={{ flex: 1 }} />

          <TouchableWithoutFeedback
            onPress={() => {
              // navigate("WalletDetailPage",{postion:parentIndex})
              navigate("WalletDetelePage", { postion: postion });
            }}
          >
            <Image
              source={require("../../../image/metalet_wallet_delete_icon.png")}
              style={{ width: 20, height: 20, marginRight: 20 }}
            />
          </TouchableWithoutFeedback>
        </View>

        {/* 头部 */}
        <View style={{ backgroundColor: "#fff", paddingBottom: 20 }}>
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Image
              source={require("../../../image/metalet_wallet_icon.png")}
              style={{ width: 90, height: 90, marginTop: 20 }}
            />

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
                {nowWallet ? nowWallet.name : ""}
              </Text>
              <Image
                source={require("../../../image/metalet_edit_icon.png")}
                style={{ width: 15, height: 15, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            color: "#333",
            marginBottom: 20,
            marginTop: 20,
            marginLeft: 20,
          }}
        >
          Wallet Backup
        </Text>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            padding: 20,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../image/metalet_wallet_men_icon.png")}
            style={{ width: 35, height: 35 }}
          />

          <Text style={{ marginLeft: 10, fontSize: 13 }}> Menmonic Phrase</Text>

          <View style={{ flex: 1 }} />

          {/* {nowWallet.isBackUp == false && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../image/metalet_dot_icon.png")}
                style={{ width: 5, height: 5, marginRight: 7 }}
              />
              <Text style={{ fontSize: 13, color: "red" }}>Not backed up</Text>
            </View>
          )} */}

          <Image
            source={require("../../../image/list_icon_ins.png")}
            style={{ width: 20, height: 20 }}
          />
        </View>

        <Text
          style={{
            fontSize: 14,
            color: "#333",
            marginBottom: 20,
            marginTop: 20,
            marginLeft: 20,
          }}
        >
          Account
        </Text>

        <View style={{ backgroundColor: "#fff", padding: 20 }}>
          <FlatList
            data={accountsOptionsList}
            renderItem={renderItem}
            // renderItem={({ item }) => (
            //   <TouchableWithoutFeedback onPress={() => {}}>
            //     <View
            //       style={{
            //         flexDirection: "row",
            //         alignItems: "center",
            //         padding: 20,
            //         borderBottomWidth: 1,
            //         borderBottomColor: "#eee",
            //       }}
            //     >
            //       <Text>{item.name}</Text>
            //     </View>
            //   </TouchableWithoutFeedback>
            // )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
