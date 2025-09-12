import {
  View,
  Text,
  TextInput,
  Image,
  Modal,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  RoundSimButton,
  TitleBar,
  useEasyToast,
  LoadingModal,
  LoadingNoticeModal,
  // GradientAvatar,
} from "../../constant/Widget";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  metaStyles,
  semiTransparentGray,
  setShowPayCode,
} from "../../constant/Constants";
import {
  CurrentAccountIDKey,
  CurrentWalletIDKey,
  wallet_password_key,
  wallets_key,
  walllet_address_type_key,
  createStorage,
  wallet_mode_hot,
  AsyncStorageUtil,
  settings_allow_small_pay_key,
} from "../../utils/AsyncStorageUtil";
import { goBack, navigate } from "../../base/NavigationService";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { getStorageWallets, isNoStorageWallet } from "../../utils/WalletUtils";
import { useData } from "../../hooks/MyProvider";
import MetaletWallet from "../../wallet/MetaletWallet";
import { createMetaletWallet } from "../../wallet/wallet";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { SmallPayBean } from "@/bean/SmallPayBean";
import {
  AutoPaymentAmountKey,
  AutoPaymentListKey,
  EnabledAutoPaymentKey,
} from "@/webs/actions/auto-payment";

const storage = createStorage();

export default function SmallPayAutoPage({ route }) {
  const [IsPasswordLock, setIsPasswordLock] = useState(true);
  const [IsSecondLock, setIsSecondLock] = useState(true);

  const [inputPassword, setInputPassword] = useState("");
  const [inputPasswordAgain, setInputPasswordAgain] = useState("");

  const [isShowNotice, setIsShowNotice] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");

  // const { type } = route.params;
  const [value, setValue] = useState("");
  const [valueAgain, setValueAgain] = useState("");

  const [isShowLoading, setIsShowLoading] = useState(false);
  const [isEnabled, setEnabled] = useState(true);

  //create
  const { myWallet, updateMyWallet } = useData();
  const { metaletWallet, updateMetaletWallet } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  const { t } = useTranslation();
  let [smallPayBeanList, setSmallPayBeanList] = useState<SmallPayBean[]>([]);

  useEffect(() => {
    // console.log("mytype", type);
    getSmallPayData();
  }, []);

  async function getSmallPayData() {
    console.log("smallPayBeanList111");
    const isEndabled = await storage.get(EnabledAutoPaymentKey, {
      defaultValue: true,
    });
    setEnabled(isEndabled);
    console.log("isEndabled:", isEndabled);

    const payAmount = await storage.get(AutoPaymentAmountKey, {
      defaultValue: 10000,
    });

    setValueAgain(payAmount.toString());

    const smallPayList = await AsyncStorageUtil.getItem(AutoPaymentListKey);

    console.log("smallPayBeanList111", smallPayList);

    if (smallPayList == null || smallPayList.length == 0) {
      // let smallPayBean = {
      //   logo: "1",
      //   host: "Show.now",
      // };
      // smallPayBeanList.push(smallPayBean);
      // setSmallPayBeanList([...smallPayBeanList]);
      // await AsyncStorageUtil.setItem(
      //   settings_allow_small_pay_key,
      //   smallPayBeanList
      // );
      // console.log("smallPayBeanList", smallPayBeanList);
    } else {
      console.log("smallPayBeanList2222");
      setSmallPayBeanList([...smallPayList]);
    }
  }

  async function addSmallPayData() {
    // console.log("smallPayBeanList111");
    // const smallPayList = await AsyncStorageUtil.getItem(AutoPaymentListKey);
    // console.log("smallPayBeanList111", smallPayList);

    // let smallPayBean = {
    //   logo: "1",
    //   host: "Show.now",
    // };

    // smallPayBeanList.push(smallPayBean);
    // setSmallPayBeanList([...smallPayBeanList]);
    // await AsyncStorageUtil.setItem(AutoPaymentListKey, smallPayBeanList);

    await storage.set(AutoPaymentAmountKey, valueAgain);
    goBack();

    console.log("smallPayBeanList", smallPayBeanList);
  }

  const ShowNotice = () => {
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 2000);
  };

  const ListItem = ({ index, item }) => {
    return (
      <TouchableWithoutFeedback onPress={async () => {}}>
        <View
          style={{
            flexDirection: "row",
            marginTop: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ marginLeft: 10, color: "#303133", fontSize: 16 }}>
            {item.host}
          </Text>
          <View style={{ flex: 1 }} />
          {item.isBackUp == false && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../../image/metalet_dot_icon.png")}
                style={{ width: 5, height: 5, marginRight: 7 }}
              />
              <Text style={{ fontSize: 13, color: "red" }}>Not backed up</Text>
            </View>
          )}
          <TouchableWithoutFeedback onPress={ async() => {
            smallPayBeanList.splice(index, 1);
            setSmallPayBeanList([...smallPayBeanList]);
            await storage.set(AutoPaymentListKey, smallPayBeanList);
            // ShowNotice();
          }}>
            <Image
              source={require("../../../image/metalet_delete_icon.png")}
              style={{ width: 15, height: 15, marginTop: 5 }}
            />
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log("click");
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <LoadingModal
          isShow={isShowLoading}
          isCancel={true}
          event={() => {
            setIsShowLoading(false);
          }}
        />
        <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

        <TitleBar />

        <View style={[metaStyles.verMarginContainer, { marginBottom: 50 }]}>
          <Text style={[metaStyles.largeDefaultText, { fontWeight: "bold" }]}>
            {t("s_small_payment_auto_approve")}
          </Text>
          <Text style={[metaStyles.smallDefaultText, { marginTop: 20 }]}>
            {t("s_small_pay_notice")}
          </Text>

          <View
            style={{
              marginTop: 33,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ marginTop: 1 }}>
              <Text style={[metaStyles.defaultText, { marginTop: 0 }]}>
                {t("s_small_enabled")}
              </Text>
              <Text style={[metaStyles.smallGrayText, { marginTop: 3 }]}>
                {t("s_small_allow")}
              </Text>
            </View>

            <TouchableWithoutFeedback
              onPress={async () => {
                setEnabled(!isEnabled);
                await storage.set(EnabledAutoPaymentKey, !isEnabled);
              }}
            >
              <Image
                source={
                  isEnabled
                    ? require("../../../image/settings_switch_select.png")
                    : require("../../../image/settings_switch_normal.png")
                }
                style={{ width: 43, height: 30 }}
              />
              {/* <Image
              source={require("../../../image/settings_switch_select.png")}
              style={{ width: 43, height: 30, }}
            /> */}
            </TouchableWithoutFeedback>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={[metaStyles.defaultText, { marginTop: 0 }]}>
              {t("s_small_allow_max")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <View>
                <Text style={[metaStyles.smallGrayText, { marginTop: 3 }]}>
                  MicrovisionChain
                </Text>
                <View
                  style={{
                    marginTop: 5,
                    backgroundColor: "rgba(247, 147, 26, 0.2)",
                    borderRadius: 10,
                    alignItems: "center",
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text style={{ fontSize: 8, color: "#FF981C" }}>
                    Bitcoin sidechain{" "}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderColor: "rgba(191, 194, 204, 0.5)",
                  flexDirection: "row",
                  borderWidth: 1,
                  height: 45,
                  borderRadius: 10,
                  marginTop: 10,
                  marginLeft: 50,
                  // backgroundColor:semiTransparentGray
                }}
              >
                <TextInput
                  placeholder="10000"
                  onChangeText={(text) => {
                    setInputPasswordAgain(text);
                    const numericValue = text.replace(/[^0-9]/g, "");
                    setValueAgain(numericValue);
                  }}
                  value={valueAgain}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    marginLeft: 10,
                    paddingRight: 10,
                  }}
                />

                <Text style={{ marginRight: 10 }}> sats</Text>
              </View>
            </View>
          </View>

          <Text style={[metaStyles.defaultText, { marginTop: 10 }]}>
            {t("s_small_allow_apps")}
          </Text>

          <FlatList
            // style={{ marginTop: 20 }}
            keyExtractor={(item, index) => index.toString()}
            data={smallPayBeanList}
            renderItem={ListItem}
          />

          <RoundSimButton
            title={t("c_confirm")}
            textColor="white"
            event={() => {
              addSmallPayData();
            }}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalView: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    // elevation: 5,
  },
});
