import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import {
  LoadingNoticeModal,
  TitleBar,
  VerifyModal,
} from "../../constant/Widget";
import { wallets_key, createStorage } from "../../utils/AsyncStorageUtil";
import { navigate } from "../../base/NavigationService";
import { eventBus, refreshHomeLoadingEvent } from "../../utils/EventBus";
import {
  getStorageWallets,
  setCurrentAccountID,
  setCurrentWalletID,
} from "../../utils/WalletUtils";
import { useTranslation } from "react-i18next";

export default function DeleteIDChatPage({ route }) {
  const [isAgree, setIsAgree] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const { postion } = route.params;
  const storage = createStorage();
  const { t } = useTranslation();

  async function deleteWallet() {
    await getStorageWallets().then(async (wallets) => {
      // await AsyncStorageUtil.getItem(wallets_key).then(async (wallets) => {
      // const nowWallet = wallets[postion];
      // //    let wallet=res.find(item=>item.id==id)
      // setnowWallet(nowWallet);
      // setAccountsOptionsList(nowWallet.accountsOptions);
      wallets.splice(postion, 1);
      if (wallets.length > 0) {
        wallets[0].accountsOptions[0].isSelect = true;
        await setCurrentWalletID(wallets[0].id);
        await setCurrentAccountID(wallets[0].accountsOptions[0].id);
        await storage.set(wallets_key, wallets).then(() => {
          setTimeout(() => {
            setIsDelete(false);
            // navigate("WalletsPage");
            navigate("SplashPage");
          }, 1000);
        });
        setIsDelete(true);
      } else {
        await storage.set(wallets_key, wallets).then(() => {
          setTimeout(() => {
            setIsDelete(false);
            navigate("WelcomeWalletPage");
          }, 1000);
        });
        setIsDelete(true);
      }
    });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingNoticeModal title="Delete Successful" isShow={isDelete} />

      <VerifyModal
        isShow={isShow}
        event={(inputText: string) => {
          setIsShow(false);
          console.log(inputText);
          deleteWallet();
        }}
        eventCancel={() => {
          setIsShow(false);
        }}
      />
      <View style={{ flex: 1 }}>
        <TitleBar />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Image
            source={require("../../../assets/adaptive-icon.png")}
            style={{ width: 113, height: 113, marginTop: 20 ,borderRadius:13}}
          />

          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 23,
                fontWeight: "bold",
                color: "#333",
                marginTop: 20,
              }}
            >
             {t("delete_idchat_title")}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 16,
              color: "#333",
              margin: 20,
              lineHeight: 22,
              textAlign: "center",
            }}
          >
            {t("delete_idchat_notice")}
          </Text>
        </View>
        <View style={{ flex: 1 }} />

        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isAgree ? (
            <TouchableWithoutFeedback
              onPress={() => {
                setIsAgree(false);
              }}
            >
              <Image
                source={require("../../../image/metalet_wallet_check_select.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
            </TouchableWithoutFeedback>
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                setIsAgree(true);
              }}
            >
              <Image
                source={require("../../../image/metalet_wallet_check_normal_icom.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
            </TouchableWithoutFeedback>
          )}

          <Text
            style={{
              fontSize: 16,
              color: "#333",
              lineHeight: 22,
            }}
          >
            {t("delete_wallet_agree")}
          </Text>
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            if (isAgree) {
              setIsShow(true);
            }
          }}
        >
          <View
            style={{
              marginTop: 20,
              marginBottom: 40,
              height: 20,
              width: "100%",
              alignItems: "center",
            }}
          >
            <View
              style={[
                {
                  flexDirection: "row",
                  height: 48,
                  width: 200,
                  backgroundColor: isAgree ? "#FA5151" : "#DBDBDB",
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                },
              ]}
            >
              <Text
                style={[
                  { textAlign: "center" },
                  { color: "#fff" },
                  { fontSize: 16 },
                ]}
              >
                {t("c_confirm")}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
}
