import {
  View,
  Text,
  SafeAreaView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  GradientAvatar,
  LoadingNoticeModal,
  TitleBar,
} from "../../constant/Widget";
import { AccountsOptions, WalletBean } from "../../bean/WalletBean";
import {  wallets_key } from "../../utils/AsyncStorageUtil";
import { useFocusEffect } from "@react-navigation/native";
import { navigate } from "../../base/NavigationService";
import { getStorageWallets } from "../../utils/WalletUtils";

export default function WalletAccountDetailPage({ route }) {
  const { PositionWallet } = route.params;
  const [showWallet, setShowWalllet] = useState<WalletBean>();
  const [showAccount, setAccount] = useState<AccountsOptions>();

  const [isCanReName, setIsCanReName] = useState(false);
  const [isShowEditWallet, setIsShowEditWallet] = useState(false);
  const [changeAccountName, setChangeAccountName] = useState("");
  const [isShowNotice, setIsShowNotice] = useState(false);

  console.log(PositionWallet);

  useEffect(() => {
    initWallet();
  }, []);

  async function initWallet() {
    await getStorageWallets().then((wallets) => {
      // await AsyncStorageUtil.getItem(wallets_key).then((wallets) => {
      const nowWallet = wallets[PositionWallet.walletIndex];
      setShowWalllet(nowWallet);
      setAccount(nowWallet.accountsOptions[PositionWallet.accountIndex]);
    });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingNoticeModal title="Successful" isShow={isShowNotice} />

      <Modal transparent={true} visible={isShowEditWallet}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Edit Name
              </Text>
              <View style={{ flex: 1 }} />

              <TouchableWithoutFeedback
                onPress={() => {
                  setIsShowEditWallet(false);
                }}
              >
                <Image
                  source={require("../../../image/metalet_close_big_icon.png")}
                  style={{ width: 15, height: 15 }}
                />
              </TouchableWithoutFeedback>
            </View>

            <Text style={{ marginTop: 20, color: "#666", fontSize: 14 }}>
              Account Name
            </Text>

            <View
              style={{
                alignItems: "center",
                borderColor: "#171AFF",
                flexDirection: "row",
                borderWidth: 1,
                height: 50,
                borderRadius: 30,
                marginTop: 20,
              }}
            >
              <TextInput
                multiline={true}
                placeholder={showAccount ? showAccount.name : ""}
                autoCapitalize={"none"}
                onChangeText={(text) => {
                  setChangeAccountName(text);
                  if (text.length > 0) {
                    setIsCanReName(true);
                  } else {
                    setIsCanReName(false);
                  }
                }}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  marginLeft: 10,
                  paddingRight: 20,
                }}
              />
            </View>

            <TouchableWithoutFeedback
              onPress={async () => {
                showAccount.name = changeAccountName;
                setAccount(showAccount);

                await getStorageWallets().then(
                  // await AsyncStorageUtil.getItem(wallets_key).then(
                  async (wallets) => {
                    const nowWallet = wallets[PositionWallet.walletIndex];
                    nowWallet.accountsOptions[
                      PositionWallet.accountIndex
                    ].name = changeAccountName;
                    await storage.set(wallets_key, wallets);
                  }
                );
                setIsShowEditWallet(false);

                setIsShowNotice(true);
                setTimeout(() => {
                  setIsShowNotice(false);
                }, 800);
              }}
            >
              <View
                style={{
                  marginTop: 20,
                  marginBottom: 20,
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
                      backgroundColor: isCanReName
                        ? "rgba(23, 26, 255, 1)"
                        : "rgba(23, 26, 255, 0.5)",
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
                    Confirm
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>

      <View style={{ flex: 1 }}>
        <TitleBar />

        <View style={{ marginTop: 20, alignItems: "center" }}>
          {/* <Image
            source={require("../../../image/metalet_wallet_icon.png")}
            style={{ width: 90, height: 90, marginTop: 20 }}
          /> */}

          <GradientAvatar
            userStyle={{ width: 90, height: 90 }}
            isRand={true}
            defaultAvatarColor={
              showAccount ? showAccount.defaultAvatarColor : []
            }
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
              {showAccount ? showAccount.name : ""}
            </Text>
            <TouchableWithoutFeedback
              onPress={() => {
                setIsShowEditWallet(true);
              }}
            >
              <Image
                source={require("../../../image/metalet_edit_icon.png")}
                style={{ width: 15, height: 15, marginLeft: 10 }}
              />
            </TouchableWithoutFeedback>
          </View>
        </View>

        {/* address */}
        <TouchableWithoutFeedback
          onPress={() => {
            navigate("AccountAddressPage", {
              SingleWallet: {
                menmonic: showWallet.mnemonic,
                addressIndex: showAccount.addressIndex,
              },
            });
          }}
        >
          <View
            style={{
              marginTop: 30,
              flexDirection: "row",
              // backgroundColor: "#fff",
              padding: 20,
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../image/metalet_wallet_icon_address.png")}
              style={{ width: 35, height: 35 }}
            />

            <Text style={{ marginLeft: 10, fontSize: 14 }}>
              {" "}
              Account Address
            </Text>

            <View style={{ flex: 1 }} />

            <Image
              source={require("../../../image/list_icon_ins.png")}
              style={{ width: 20, height: 20 }}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* private key */}
        <View
          style={{
            flexDirection: "row",
            // backgroundColor: "#fff",
            padding: 20,
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../../image/metalet_wallet_icon_key.png")}
            style={{ width: 35, height: 35 }}
          />

          <Text style={{ marginLeft: 10, fontSize: 14 }}>
            View Private Key{" "}
          </Text>

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
      </View>
    </SafeAreaView>
  );
}
