import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Modal,
  BackHandler,
  Platform,
  ImageBackground,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { navigate } from "../base/NavigationService";
import { grayNormalColor, metaStyles, showPayCode, themeColor } from "../constant/Constants";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CustomTabBar,
  GradientAvatar,
  LoadingModal,
  LoadingNoticeModal,
  RoundSimButtonFlee,
} from "../constant/Widget";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import AssetsPage from "./AssetsPage";
import FtPage from "./FtPage";
import NftPage from "./NftPage";
import { useData } from "../hooks/MyProvider";
import {
  network_all,
  network_btc,
  network_key,
  network_mvc,
  createStorage,
  AsyncStorageUtil,
  wallet_mode_key,
  wallet_mode_cold,
  wallet_mode_hot,
  wallet_language_key,
  wallet_mode_observer,
} from "../utils/AsyncStorageUtil";
import { AddressType, Chain } from "@metalet/utxo-wallet-service";
import { BtcWallet, MvcWallet } from "@metalet/utxo-wallet-service";
import * as Clipboard from "expo-clipboard";
import { eventBus, refreshHomeLoadingEvent } from "../utils/EventBus";
import FtParentPage from "./nft/FtParentPage";
import FtMvcPage from "./nft/FtMvcPage";
import FtBtcPage from "./nft/FtBtcPage";
import NftParentPage from "./nft/NftParentPage";
import NftBtcPage from "./nft/NftBtcPage";
import NftMvcPage from "./nft/NftMvcPage";
import {
  getBtcWallet,
  getCurrentBtcWallet,
  getCurrentMvcWallet,
  sendHotBtcTest,
} from "../wallet/wallet";

import {
  getCurrentWalletAccount,
  getStorageCurrentWallet,
  getWalletMode,
  openBrowser,
} from "../utils/WalletUtils";
import { caculateMvcAndBtcAssert, getOneIcons } from "../utils/AssertUtils";
import { ShowBalance } from "../api/type/Balance";
import useWalletStore from "@/stores/useWalletStore";
import useWalletManager from "@/hooks/useWalletManager";
import useNetworkStore from "@/stores/useNetworkStore";
import { fetchCheckUpgrade, fetchMrc20Price } from "@/api/metaletservice";
import { UpdateData } from "@/api/type/Update";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import MetaIDPage from "./nft/MetaIDPage";
import { BtcHotWallet } from "@metalet/utxo-wallet-sdk";
import i18n from "@/language/i18n";
import { useTranslation } from "react-i18next";

const storage = createStorage();

// Home 开发
const TabsTop = createMaterialTopTabNavigator();

// 待发布 version 3.1.3 code 33

export default function HomeColdPage({ navigation }) {
  const { metaletWallet, updateMetaletWallet } = useData();
  const { setCurrentWallet } = useWalletStore();
  const { myWallet, updateMyWallet } = useData();
  const { walletMode, updateWalletMode } = useData();
  const { spaceBalance, updateSpaceBalance } = useData();
  const { btcBalance, updateSetBtcBalance } = useData();
  // const [sumBalance, setSumBalance] = useState<string>("0.0");
  const { currentSumBalance, updateCurrentSumBalance } = useData();

  //提示
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [noticeContent, setNoticeContent] = useState("Successful");

  //复制地址
  const [isShowCopy, setIsShowCopy] = useState(false);
  const [legacyAddress, setLegacyAddress] = useState<string>();
  const [taprootAddress, setTaprootAddress] = useState<string>();
  const [nestedSegwitAddress, setNestedSegwitAddress] = useState<string>();
  const [nativeSegwitAddress, setNativeSegwitAddress] = useState<string>();
  // const [sameBtcAsMvcAddress, setSameBtcAsMvcAddress] = useState<string>();
  const { btcSameAsMvcAddress, updateBtcSameAsMvcAddress } = useData();

  // const [mvcAddress, setMvcAddress] = useState<string>();

  // 当前网络
  const { netWork, updateNetWork } = useData();
  const { network, switchNetwork } = useNetworkStore();

  //当前网络地址
  const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();

  const { needRefreshHome, updateNeedRefreshHome } = useData();
  const { needInitWallet, updateNeedInitWallet } = useData();
  const { walletLanguage, updateWalletLanguage } = useData();
  const [userAvater, setuserAvater] = useState<string[]>([]);
  const [accountName, setaccountName] = useState("");
  const [walletName, setWalletName] = useState("");
  // const { walletManager, getCurrentChainWallet } = useWalletManager();

  const [hasUpdate, setUpdate] = useState(false);
  const [updateUrl, setUpdateUrl] = useState("");

  const versionCode = Constants.expoConfig?.android.versionCode;
  const buildNumber = Constants.expoConfig?.ios.buildNumber;
  const platformNow = Platform.OS;
  const { isShowPay, updateIsShowPay } = useData();
  const { t } = useTranslation(); // 获取翻译函数

  useEffect(() => {
    // setIsShowLoading(true);
    initCurrentWallet().then(() => {
      // setIsShowLoading(false);
    });

    eventBus.subscribe(refreshHomeLoadingEvent, (message) => {
      console.log("in eventBus", message);
      setIsShowLoading(true);
      initCurrentWallet().then(() => {
        setIsShowLoading(false);
      });
    });

    changeLanguage();

    // 立即调用一次获取数据
    // fetchData();
    // 设置轮询，每隔5秒获取一次数据
    // const intervalId = setInterval( ()=>{
    //   getShowBalance();
    // }, 15000);

    // 清除定时器，防止内存泄漏
    // return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // console.log("HomePage useEffect   btc change");
    // setIsShowLoading(true);
    if (btcAddress) {
      // setIsShowLoading(false);
      getShowBalance();
    }
  }, [btcAddress]);

  useEffect(() => {
    console.log("HomePage needRefreshHome ");
    getShowBalance();
  }, [needRefreshHome]);

  useEffect(() => {
    // console.log("HomePage needInitWallet ");
    initCurrentWallet();
  }, [needInitWallet]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      // Prevent default behavior
      // e.preventDefault();
      console.log("Home tab was pressed");
      getShowBalance();
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // console.log("Home page is focused");

      // Add event listener for back button press
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          BackHandler.exitApp();
          return true;
        }
      );
      // Clean up the event listener when the screen is unfocused or component unmounts
      return () => backHandler.remove();
    }, [])
  );

  function ShowNotice(notice) {
    setIsShowCopy(false);
    Clipboard.setString(notice);
    setNoticeContent("Copy Successful");
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 800);
  }

  const getShowBalance = async () => {
    const mode = await AsyncStorageUtil.getItem(wallet_mode_key);
    let nowMvcAddress;
    let nowBtcAddress;

    // if (mode && wallet_mode_cold === mode) {
    //   const swallet = await getStorageCurrentWallet();
    //   nowBtcAddress = swallet.coldAddress;
    //   nowMvcAddress = swallet.coldAddress;
    //   // console.log("nowBtcAddress", nowBtcAddress);
    // } else {
    //   const nowMvcWallet = await getCurrentMvcWallet();
    //   const nowBtcWallet = await getCurrentBtcWallet();
    //   nowMvcAddress = nowMvcWallet.getAddress();
    //   nowBtcAddress = nowBtcWallet.getAddress();
    // }

    // const showbalance: ShowBalance = await caculateMvcAndBtcAssert(
    //   nowMvcAddress,
    //   nowBtcAddress
    // );
    // metaletWallet.currentMvcBalance = showbalance.spaceBalance;
    // metaletWallet.currentBtcBalance = showbalance.btcBalance;
    // metaletWallet.currentSumAssert = showbalance.sumAssert;
    // metaletWallet.currentBtcAssert = showbalance.btcAssert;
    // metaletWallet.currentSpaceAssert = showbalance.spaceAssert;

    // console.log("metaletWallet 余额刷新 ", metaletWallet.currentMvcBalance);
    // updateSpaceBalance(showbalance.spaceBalance);
    // updateSetBtcBalance(showbalance.btcBalance);

    // updateCurrentSumBalance(showbalance.sumAssert);
    updateMetaletWallet(metaletWallet);
  };
  //初始化所有钱包
  async function initCurrentWallet() {
    console.log("initCurrentWallet", "触发钱包刷新");

    // const mode = await AsyncStorageUtil.getItem(wallet_mode_key);
    // const _wallet_mode = await getWalletMode();
    if (wallet_mode_observer === walletMode) {
      const nowWallet = await getStorageCurrentWallet();
      const nowAccount = await getCurrentWalletAccount();
      // updateWalletMode(wallet_mode_cold);
      setWalletName(nowWallet.name);
      setaccountName(nowAccount.name);
      setuserAvater(nowAccount.defaultAvatarColor);
      updateMvcAddress(nowWallet.coldAddress);
      updateBtcAddress(nowWallet.coldAddress);

      //init HotWallet
      const publicKey = nowWallet.coldPublicKey;
      console.log("network", network);
      const hotBtcWallet = new BtcHotWallet({
        network: network,
        publicKey: publicKey,
        addressType: nowWallet.addressType,
      });
      console.log("HotWallet Address :" + hotBtcWallet.getAddress());
      metaletWallet.currentBtcColdWallet = hotBtcWallet;
      updateMetaletWallet(metaletWallet);

      getShowBalance();
    } else {
      console.log("initCurrentWallet 进入冷钱包");

      await storage.get(network_key).then(async (saveNet) => {
        if (saveNet == null) {
          // console.log("saveNet is null" + saveNet);
          await storage.set(network_key, network_all);
          // await AsyncStorageUtil.setItem(network_key, network_all);
          updateNetWork(network_all);
        } else {
          // console.log(saveNet);

          updateNetWork(saveNet);
        }
      });

      const nowWallet = await getStorageCurrentWallet();
      const nowAccount = await getCurrentWalletAccount();

      setWalletName(nowWallet.name);
      setaccountName(nowAccount.name);
      setuserAvater(nowAccount.defaultAvatarColor);

      updateMyWallet(nowWallet);
      const btcTaprootWallet = await getBtcWallet(AddressType.Taproot);
      setTaprootAddress(btcTaprootWallet.getAddress());
      const btcNativeSegwitWallet = await getBtcWallet(
        AddressType.NativeSegwit
      );
      setNativeSegwitAddress(btcNativeSegwitWallet.getAddress());
      const btcNestedSegwitWallet = await getBtcWallet(
        AddressType.NestedSegwit
      );
      setNestedSegwitAddress(btcNestedSegwitWallet.getAddress());
      const btcLegacyWallet = await getBtcWallet(AddressType.Legacy);
      setLegacyAddress(btcLegacyWallet.getAddress());
      const btcSameAsLegacyWallet = await getBtcWallet(AddressType.SameAsMvc);
      updateBtcSameAsMvcAddress(btcSameAsLegacyWallet.getAddress());
      const mvcWallet = await getCurrentMvcWallet();
      const currentBtcWallet = await getCurrentBtcWallet();

      updateMvcAddress(mvcWallet.getAddress());
      // console.log('address mvc : ',mvcWallet.getAddress())
      updateBtcAddress(currentBtcWallet.getAddress());

      metaletWallet.currentBtcWallet = currentBtcWallet;
      metaletWallet.currentMvcWallet = mvcWallet;
      metaletWallet.btcLegacyWallet = btcLegacyWallet;
      metaletWallet.btcNativeSegwitWallet = btcNativeSegwitWallet;
      metaletWallet.btcNestedSegwitWallet = btcNestedSegwitWallet;
      metaletWallet.btcTaprootWallet = btcTaprootWallet;
      metaletWallet.btcSameAsWallet = btcSameAsLegacyWallet;

      //webs
      const btcWalletWebs = metaletWallet.currentBtcWallet;
      const mvcWalletWebs = metaletWallet.currentMvcWallet;
      setCurrentWallet({ btcWallet: btcWalletWebs, mvcWallet: mvcWalletWebs });

      updateMetaletWallet(metaletWallet);
      getShowBalance();
    }
  }

  // useEffect(() => {
  //   if (walletManager) {
  //     getCurrentChainWallet(Chain.BTC).then((btcWallet) => {
  //       // console.log("btc address", network, btcWallet.getAddress());
  //     });
  //     getCurrentChainWallet(Chain.MVC).then((mvcWallet) => {
  //       // console.log("mvc address", network, mvcWallet.getAddress());
  //     });
  //   }
  //   setIsShowLoading(false)
  // }, [walletManager]);

  const changeLanguage = async () => {
    // const newLanguage = i18n.language === 'en' ? 'zh' : 'en';
    const newLanguage = await AsyncStorageUtil.getItemDefault(
      wallet_language_key,
      "en"
    );
    i18n.changeLanguage(newLanguage); // 切换语言
    updateWalletLanguage(newLanguage);
  };

  return (
    <SafeAreaView style={metaStyles.parentContainer}>
      <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
        }}
      >
        <LoadingModal
          isShow={isShowLoading}
          isCancel={true}
          event={() => {
            setIsShowLoading(false);
          }}
        />
        <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

        {/* 底部地址 */}
        <Modal transparent={true} visible={isShowCopy}>
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
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,

                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
                paddingBottom: 30,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  Select Wallet Address
                </Text>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setIsShowCopy(false);
                  }}
                >
                  <Image
                    source={require("../../image/metalet_close_big_icon.png")}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* btc Legacy */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_btc.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Bitcoin
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        Legacy
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {legacyAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    ShowNotice(legacyAddress);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* btc nested segwit */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_btc.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Bitcoin
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        Nested SegWit
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {nestedSegwitAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    ShowNotice(nestedSegwitAddress);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* native segwit */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_btc.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Bitcoin
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        Native SegWit
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {nativeSegwitAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    ShowNotice(nativeSegwitAddress);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>
              {/* taproot */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_btc.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Bitcoin
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        Taproot
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {taprootAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    if (
                      metaletWallet.btcTaprootWallet &&
                      metaletWallet.btcTaprootWallet.getAddress()
                    ) {
                      ShowNotice(taprootAddress);
                    }
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* sameAsMvc */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_btc.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      Bitcoin
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        Default
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {btcSameAsMvcAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    ShowNotice(btcSameAsMvcAddress);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* mvc */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/logo_space.png")}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                      MVC
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 5,
                        backgroundColor: "#F5F7F9",
                        paddingHorizontal: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        MVC
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: "#666" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {mvcAddress}
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => {
                    ShowNotice(mvcAddress);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* over */}
            </View>
          </View>
        </Modal>

        {/* 中部 */}
        <View
          style={[
            metaStyles.rowMarginContainer,
            { height: 45, alignItems: "center" },
          ]}
        >
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 44, height: 44 }}
          />
          <View style={{ flex: 1 }} />
          {network == "testnet" && (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F3F3FF",
                borderRadius: 5,
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Image
                source={require("../../image/net_icon.png")}
                style={{ width: 15, height: 15 }}
              />

              <Text
                style={{
                  color: themeColor,
                  textAlign: "center",
                  marginLeft: 5,
                  fontSize: 12,
                }}
              >
                Testnet
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F3FF",
              borderRadius: 5,
              paddingHorizontal: 5,
              paddingVertical: 5,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
  
            <Text
              style={{
                color: grayNormalColor,
                textAlign: "center",
                marginLeft: 5,
                fontSize: 12,
              }}
            >
              {t("s_cold_mode")}
            </Text>
          </View>

          {/* {netWork == null ||
            (netWork == network_all && (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigate("NetWorkPage");
                }}
              >
                <Image
                  source={require("../../image/metalet_network_all_icon.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableWithoutFeedback>
            ))}

          {netWork == network_btc && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigate("NetWorkPage");
              }}
            >
              <Image
                source={require("../../image/meta_btc_icon.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableWithoutFeedback>
          )}

          {netWork == network_mvc && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigate("NetWorkPage");
              }}
            >
              <Image
                source={require("../../image/logo_space.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableWithoutFeedback>
          )}
          <Image
            source={require("../../image/meta_last_icon.png")}
            style={{ width: 8, height: 6, marginLeft: 5 }}
          /> */}

          {/* <Button onPress={changeNetWork} title={network} />
        <Button onPress={getWallets} title="getWallets" /> */}
        </View>

        <View style={[metaStyles.varContainer, { marginHorizontal: 30 }]}>
          <View style={[metaStyles.rowContainer, { alignItems: "center" }]}>
            <GradientAvatar isRand={false} defaultAvatarColor={userAvater} />
            <View style={{ marginLeft: 10 }}>
              <View style={[metaStyles.rowCenterContainer, { height: 20 }]}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    navigate("WalletsPage");
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={metaStyles.grayTextdefault66}>
                      {walletName}-
                    </Text>
                    <Text style={metaStyles.defaultText}>{accountName}</Text>
                  </View>
                </TouchableWithoutFeedback>

                <Image
                  source={require("../../image/meta_last_icon.png")}
                  style={{ width: 8, height: 6, marginLeft: 5 }}
                />
                {/* <TouchableWithoutFeedback
                  onPress={() => {
                    if (metaletWallet.currentMvcWallet != null)
                      setIsShowCopy(true);
                  }}
                >
                  <Image
                    source={require("../../image/meta_copy_icon.png")}
                    style={{ width: 14, height: 14, marginLeft: 10 }}
                  />
                </TouchableWithoutFeedback> */}
              </View>

              <Text style={[metaStyles.bigLargeDefaultText, { marginTop: 3 }]}>
                {/* {"$ " + currentSumBalance} */}
                {"$ 0.00"}
              </Text>
            </View>

            <View style={{ flex: 1 }} />
          </View>

          <View
            style={[
              metaStyles.rowContainer,
              {
                justifyContent: "space-around",
                marginTop: 40,
                height: 40,
              },
            ]}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                navigate("ColdAssetWalletPage");
              }}
            >
              <View
                style={{
                  backgroundColor: "#303133",
                  flexDirection: "row",
                  borderRadius: 18,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../image/cold_asset_icon.png")}
                  style={{ width: 20, height: 20 }}
                />
                <Text
                  style={[
                    {
                      color: "#fff",
                      fontSize: 14,
                      lineHeight: 20,
                      marginLeft: 10,
                    },
                  ]}
                >
                  {t("s_cold_asset")}
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                navigate("ReceiveColdPage");
              }}
            >
              <View
                style={{
                  backgroundColor: themeColor,
                  flexDirection: "row",
                  borderRadius: 18,
                  flex: 1,
                  marginLeft: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../image/cold_receive_icon.png")}
                  style={{ width: 20, height: 20 }}
                />
                <Text
                  style={[
                    {
                      color: "#fff",
                      fontSize: 14,
                      lineHeight: 20,
                      marginLeft: 10,
                    },
                  ]}
                >
                  {t("h_receive")}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

          {/* <MyTabs /> */}
          {/* {[network_all].includes(netWork) && <MyTabs01 />}
        {[, network_btc].includes(netWork) && <MyTabs02 />}
        {[, network_mvc].includes(netWork) && <MyTabs03 />} */}

          {/* {netWork == network_all && <MyTabs01 />}

          {netWork == network_btc && <MyTabs02 />}

          {netWork == network_mvc && <MyTabs03 />} */}
        </View>
      </View>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
}

function MyTabs() {
  return (
    <TabsTop.Navigator
      tabBarPosition="top"
      tabBar={(props) => <CustomTabBar {...props} />}
      style={{ flex: 1, marginBottom: 20, marginTop: 10 }}
      screenOptions={{
        tabBarScrollEnabled: true,
        swipeEnabled: false,
      }}

      // screenOptions={{
      //   tabBarLabelStyle:{fontSize:15,fontWeight:'bold',textTransform: 'none',},
      //   tabBarInactiveTintColor:'#666666',
      //   tabBarActiveTintColor:'#000000',
      //   tabBarStyle:{backgroundColor:'#fff',height:50,elevation: 0 },
      //   tabBarIndicatorStyle:{backgroundColor:'#1F2CFF',height:3,width:20,marginLeft:40},
      //   tabBarItemStyle:{height:50,width:100,},//每个item 宽度
      // }}
      // style={{ flex: 1, marginBottom: 20,marginTop: 10 }}
    >
      <TabsTop.Screen
        name="Assets"
        options={{ title: "Assets" }}
        component={AssetsPage}
      />
      <TabsTop.Screen name="FT" options={{ title: "FTs" }} component={FtPage} />
      <TabsTop.Screen
        name="NFT"
        options={{ title: "NFTs" }}
        component={NftPage}
      />
    </TabsTop.Navigator>
  );
}

function MyTabs01() {
  return (
    <TabsTop.Navigator
      tabBarPosition="top"
      tabBar={(props) => <CustomTabBar {...props} />}
      style={{ flex: 1, marginBottom: 20, marginTop: 20 }}
    >
      <TabsTop.Screen
        name="Crypto"
        options={{ title: "Crypto" }}
        component={AssetsPage}
      />

      <TabsTop.Screen
        name="FT1"
        options={{ title: "FTs" }}
        component={FtParentPage}
      />
      <TabsTop.Screen
        name="NFT1"
        options={{ title: "NFTs" }}
        component={NftParentPage}
      />

      <TabsTop.Screen
        name="MetaID1"
        options={{ title: "PIN" }}
        component={MetaIDPage}
      />
    </TabsTop.Navigator>
  );
}

function MyTabs02() {
  return (
    <TabsTop.Navigator
      tabBarPosition="top"
      tabBar={(props) => <CustomTabBar {...props} />}
      style={{ flex: 1, marginBottom: 20, marginTop: 20 }}
    >
      <TabsTop.Screen
        name="Crypto"
        options={{ title: "Crypto" }}
        component={AssetsPage}
      />

      <TabsTop.Screen
        name="FT2"
        options={{ title: "FTs" }}
        component={FtBtcPage}
      />
      <TabsTop.Screen
        name="NFT2"
        options={{ title: "NFTs" }}
        component={NftBtcPage}
      />
      <TabsTop.Screen
        name="MetaID2"
        options={{ title: "PIN" }}
        component={MetaIDPage}
      />
    </TabsTop.Navigator>
  );
}

function MyTabs03() {
  return (
    <TabsTop.Navigator
      tabBarPosition="top"
      tabBar={(props) => <CustomTabBar {...props} />}
      style={{ flex: 1, marginBottom: 20, marginTop: 20 }}
    >
      <TabsTop.Screen
        name="Crypto3"
        options={{ title: "Crypto" }}
        component={AssetsPage}
      />

      <TabsTop.Screen
        name="FT3"
        options={{ title: "FTs" }}
        component={FtMvcPage}
      />
      <TabsTop.Screen
        name="NFT3"
        options={{ title: "NFTs" }}
        component={NftMvcPage}
      />
      <TabsTop.Screen
        name="MetaID3"
        options={{ title: "PIN" }}
        component={MetaIDPage}
      />
    </TabsTop.Navigator>
  );
}
