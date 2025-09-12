import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Modal,
  BackHandler,
  Platform,
  ImageBackground,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { goBack, navigate } from '../base/NavigationService';
import { grayNormalColor, metaStyles, showPayCode, themeColor } from '../constant/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CustomTabBar,
  GradientAvatar,
  LoadingModal,
  LoadingNoticeModal,
  RoundSimButtonFlee,
  ToastView,
} from '../constant/Widget';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import AssetsPage from './AssetsPage';
import FtPage from './FtPage';
import NftPage from './NftPage';
import { useData } from '../hooks/MyProvider';
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
} from '../utils/AsyncStorageUtil';
import { AddressType, Chain } from '@metalet/utxo-wallet-service';
import { BtcWallet, MvcWallet } from '@metalet/utxo-wallet-service';
import * as Clipboard from 'expo-clipboard';
import { eventBus, refreshHomeLoadingEvent } from '../utils/EventBus';
import FtParentPage from './nft/FtParentPage';
import FtMvcPage from './nft/FtMvcPage';
import FtBtcPage from './nft/FtBtcPage';
import NftParentPage from './nft/NftParentPage';
import NftBtcPage from './nft/NftBtcPage';
import NftMvcPage from './nft/NftMvcPage';
import {
  getBtcWallet,
  getCurrentBtcWallet,
  getCurrentMvcWallet,
  sendHotBtcTest,
} from '../wallet/wallet';

import {
  getCurrentWalletAccount,
  getStorageCurrentWallet,
  getWalletMode,
  openBrowser,
} from '../utils/WalletUtils';
import { caculateMvcAndBtcAssert, getOneIcons } from '../utils/AssertUtils';
import { ShowBalance } from '../api/type/Balance';
import useWalletStore from '@/stores/useWalletStore';
import useWalletManager from '@/hooks/useWalletManager';
import useNetworkStore from '@/stores/useNetworkStore';
import { fetchCheckUpgrade, fetchMrc20Price } from '@/api/metaletservice';
import { UpdateData } from '@/api/type/Update';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import MetaIDPage from './nft/MetaIDPage';
import { BtcHotWallet } from '@metalet/utxo-wallet-sdk';
import i18n from '@/language/i18n';
import { useTranslation } from 'react-i18next';

const storage = createStorage();

// Home 开发
const TabsTop = createMaterialTopTabNavigator();

// 待发布 version 3.1.3 code 33

export default function HomePage({ navigation }) {
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
  const [noticeContent, setNoticeContent] = useState('Successful');

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
  const [accountName, setaccountName] = useState('');
  const [walletName, setWalletName] = useState('');
  // const { walletManager, getCurrentChainWallet } = useWalletManager();

  const [hasUpdate, setUpdate] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');

  const versionCode = Constants.expoConfig?.android.versionCode;
  const buildNumber = Constants.expoConfig?.ios.buildNumber;
  const platformNow = Platform.OS;
  const { isShowPay, updateIsShowPay } = useData();
  const { t } = useTranslation(); // 获取翻译函数

  // "package": "com.metalet.utxowallet",
  // "package": "com.utxo.wallet",

  useEffect(() => {
    setIsShowLoading(true);
    initCurrentWallet().then(() => {
      setIsShowLoading(false);
      // checkUpgrade();
    });

    eventBus.subscribe(refreshHomeLoadingEvent, (message) => {
      console.log('in eventBus', message);
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
    setIsShowLoading(true);
    if (btcAddress) {
      setIsShowLoading(false);
      getShowBalance();
    }
  }, [btcAddress]);

  useEffect(() => {
    console.log('HomePage needRefreshHome ');
    getShowBalance();
  }, [needRefreshHome]);

  useEffect(() => {
    // console.log("HomePage needInitWallet ");
    initCurrentWallet();
  }, [needInitWallet]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Prevent default behavior
      // e.preventDefault();
      console.log('Home tab was pressed');
      getShowBalance();
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // console.log("Home page is focused");
      console.log('walletMid==', walletMode);

      // Add event listener for back button press
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });
      // Clean up the event listener when the screen is unfocused or component unmounts
      return () => backHandler.remove();
    }, []),
  );

  function ShowNotice(notice) {
    setIsShowCopy(false);
    Clipboard.setString(notice);
    setNoticeContent('Copy Successful');
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 800);
  }

  async function checkUpgrade() {
    //android 更新跟当前的应用的Code 保持一致即可
    if (platformNow === 'android') {
      const check: UpdateData = await fetchCheckUpgrade('android');
      console.log(JSON.stringify(check));
      const codeVersion = check.data.version_code;
      // setUpdateUrl(check.data.url);
      setUpdateUrl(check.data.apkUrl);
      if (codeVersion > versionCode) {
        setUpdate(true);
      }
    } else {
      // 36 codeVersion改为当前版本
      const check: UpdateData = await fetchCheckUpgrade('ios');
      // console.log(JSON.stringify(check));
      const codeVersion = check.data.version_code;
      setUpdateUrl(check.data.url);
      console.log('codeVersion', codeVersion);
      console.log('buildNumber', buildNumber);

      if (codeVersion > parseFloat(buildNumber)) {
        setUpdate(true);
      }
    }
  }

  const getShowBalance = async () => {
    let nowMvcAddress;
    let nowBtcAddress;

    if (wallet_mode_observer === walletMode) {
      const swallet = await getStorageCurrentWallet();
      nowBtcAddress = swallet.coldAddress;
      nowMvcAddress = swallet.coldAddress;
      // console.log("nowBtcAddress", nowBtcAddress);
    } else {
      const nowMvcWallet = await getCurrentMvcWallet();
      const nowBtcWallet = await getCurrentBtcWallet();
      nowMvcAddress = nowMvcWallet.getAddress();
      nowBtcAddress = nowBtcWallet.getAddress();
    }

    const sumBalance = await AsyncStorageUtil.getItemDefault(nowBtcAddress, '0.0');
    // console.log("sumBalance-------------", sumBalance);
    updateCurrentSumBalance(sumBalance);

    const showbalance: ShowBalance = await caculateMvcAndBtcAssert(nowMvcAddress, nowBtcAddress);
    metaletWallet.currentMvcBalance = showbalance.spaceBalance;
    metaletWallet.currentBtcBalance = showbalance.btcBalance;
    metaletWallet.currentSumAssert = showbalance.sumAssert;
    metaletWallet.currentBtcAssert = showbalance.btcAssert;
    metaletWallet.currentSpaceAssert = showbalance.spaceAssert;
    metaletWallet.currentBtcNa = showbalance.btcNa;
    metaletWallet.currentBtcSafeBalance = showbalance.btcSafeBalance;

    // console.log("metaletWallet 余额刷新 ", metaletWallet.currentMvcBalance);
    updateSpaceBalance(showbalance.spaceBalance);
    updateSetBtcBalance(showbalance.btcBalance);

    if (sumBalance == '0.0') {
      updateCurrentSumBalance(showbalance.sumAssert);
    }

    AsyncStorageUtil.setItem(nowBtcAddress, showbalance.sumAssert);
    updateMetaletWallet(metaletWallet);
  };
  //初始化所有钱包
  async function initCurrentWallet() {
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
      const hotBtcWallet = new BtcHotWallet({
        network: network,
        publicKey: publicKey,
        addressType: nowWallet.addressType,
      });
      console.log('进入观察者钱包模式------------');

      console.log('HotWallet Address :' + hotBtcWallet.getAddress());
      metaletWallet.currentBtcColdWallet = hotBtcWallet;
      updateMetaletWallet(metaletWallet);

      getShowBalance();
    } else {
      // updateWalletMode(wallet_mode_hot);
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
      const btcNativeSegwitWallet = await getBtcWallet(AddressType.NativeSegwit);
      setNativeSegwitAddress(btcNativeSegwitWallet.getAddress());
      const btcNestedSegwitWallet = await getBtcWallet(AddressType.NestedSegwit);
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
    const newLanguage = await AsyncStorageUtil.getItemDefault(wallet_language_key, 'en');
    i18n.changeLanguage(newLanguage); // 切换语言
    updateWalletLanguage(newLanguage);
  };

  return (
    <SafeAreaView style={metaStyles.parentContainer}>
      {/* <Image
        source={require("../../assets/splash.png")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: -1,
        }}
      /> */}

      {/* <ImageBackground
        source={require("../../image/me_first_choose_wallet.png")} // 替换为你的图片路径
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      > */}

      {/* upgrade  */}
      <Modal visible={hasUpdate} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 30,
              marginHorizontal: 25,
              paddingTop: 20,
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* <Image
                source={require("../../image/receive_mvc_icon.png")}
                style={{ width: 50, height: 50 }}
              /> */}

              <Text
                style={{
                  color: '#333',
                  textAlign: 'center',
                  lineHeight: 20,
                  marginTop: 20,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                New version
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#333', fontSize: 14 }}>
                New version available. Would you like to download the update now?
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 40,
                justifyContent: 'space-between',
              }}
            >
              <RoundSimButtonFlee
                title={'Cancel'}
                style={{
                  borderRadius: 10,
                  height: 40,
                  width: '45%',
                  borderWidth: 1,
                  borderColor: themeColor,
                }}
                color="#fff"
                textColor="#171AFF"
                event={() => {
                  setUpdate(false);
                }}
              />

              <RoundSimButtonFlee
                title={'Confirm'}
                style={{ borderRadius: 10, height: 40, width: '45%' }}
                textColor="#fff"
                event={() => {
                  setUpdate(false);
                  openBrowser(updateUrl);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          backgroundColor: '#fff',
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
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
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
                    source={require('../../image/metalet_close_big_icon.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* btc Legacy */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_btc.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Bitcoin</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        Legacy
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* btc nested segwit */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_btc.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Bitcoin</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        Nested SegWit
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* native segwit */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_btc.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Bitcoin</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        Native SegWit
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>
              {/* taproot */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_btc.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Bitcoin</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        Taproot
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* sameAsMvc */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_btc.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Bitcoin</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        Default
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* mvc */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  marginHorizontal: 10,
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../image/logo_space.png')}
                  style={{ width: 35, height: 35, marginLeft: 20 }}
                />

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>MVC</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 5,
                        backgroundColor: '#F5F7F9',
                        paddingHorizontal: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        MVC
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{ marginTop: 5, fontSize: 10, color: '#666' }}
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
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              {/* over */}
            </View>
          </View>
        </Modal>

        {/* 中部 */}
        <View style={[metaStyles.rowMarginContainer, { height: 45, alignItems: 'center' }]}>
          <TouchableWithoutFeedback
            onPress={() => {
              goBack();
            }}
          >
            <Image
              source={require('../../image/meta_back_icon.png')}
              style={{ width: 22, height: 22 }}
            />
          </TouchableWithoutFeedback>
          <View style={{ flex: 1 }} />
          {network == 'testnet' && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F3F3FF',
                borderRadius: 5,
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Image
                source={require('../../image/net_icon.png')}
                style={{ width: 15, height: 15 }}
              />

              <Text
                style={{
                  color: themeColor,
                  textAlign: 'center',
                  marginLeft: 5,
                  fontSize: 12,
                }}
              >
                Testnet
              </Text>
            </View>
          )}

          {walletMode == wallet_mode_observer && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F3F3FF',
                borderRadius: 5,
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: grayNormalColor,
                  textAlign: 'center',
                  marginLeft: 5,
                  fontSize: 12,
                }}
              >
                {t('s_cold_observer_wallet_mode')}
              </Text>
            </View>
          )}

          {netWork == null ||
            (netWork == network_all && (
              <TouchableWithoutFeedback
                onPress={() => {
                  navigate('NetWorkPage');
                }}
              >
                <Image
                  source={require('../../image/metalet_network_all_icon.png')}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableWithoutFeedback>
            ))}

          {netWork == network_btc && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigate('NetWorkPage');
              }}
            >
              <Image
                source={require('../../image/meta_btc_icon.png')}
                style={{ width: 24, height: 24 }}
              />
            </TouchableWithoutFeedback>
          )}

          {netWork == network_mvc && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigate('NetWorkPage');
              }}
            >
              <Image
                source={require('../../image/logo_space.png')}
                style={{ width: 24, height: 24 }}
              />
            </TouchableWithoutFeedback>
          )}
          <Image
            source={require('../../image/meta_last_icon.png')}
            style={{ width: 8, height: 6, marginLeft: 5 }}
          />

          {/* <Button onPress={changeNetWork} title={network} />
        <Button onPress={getWallets} title="getWallets" /> */}
        </View>

        <View style={[metaStyles.varContainer, { marginHorizontal: 30 }]}>
          <View style={[metaStyles.rowContainer, { alignItems: 'center' }]}>
            <GradientAvatar isRand={false} defaultAvatarColor={userAvater} />
            <View style={{ marginLeft: 10 }}>
              <View style={[metaStyles.rowCenterContainer, { height: 20 }]}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    navigate('WalletsPage');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={metaStyles.grayTextdefault66}>{walletName}-</Text>
                    <Text style={metaStyles.defaultText}>{accountName}</Text>
                  </View>
                </TouchableWithoutFeedback>

                <Image
                  source={require('../../image/meta_last_icon.png')}
                  style={{ width: 8, height: 6, marginLeft: 5 }}
                />
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (metaletWallet.currentMvcWallet != null) setIsShowCopy(true);
                  }}
                >
                  <Image
                    source={require('../../image/meta_copy_icon.png')}
                    style={{ width: 14, height: 14, marginLeft: 10 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              <Text style={[metaStyles.bigLargeDefaultText, { marginTop: 3 }]}>
                {'$ ' + currentSumBalance}
              </Text>
            </View>

            <View style={{ flex: 1 }} />
          </View>

          <View
            style={[
              metaStyles.rowContainer,
              {
                justifyContent:
                  isShowPay != showPayCode || walletMode == wallet_mode_observer
                    ? 'space-around'
                    : 'space-between',
                marginTop: 10,
              },
            ]}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                // updateUserData({ ...userData, name: "校长" });
                //  AsyncStorage.removeItem(network_key);
                // console.log(metaletWallet.btcLegacyWallet.getAddress());
                // navigate("PasswordPage");
                // Toast.show({
                //   type: 'info',
                //   text1: 'Hello',
                //   visibilityTime: 2000,
                // });

                if (walletMode == wallet_mode_observer) {
                  ToastView({ text: 'come soon', type: 'info' });
                  return;
                }
                if (netWork == network_mvc) {
                  navigate('SendSpacePage');
                } else if (netWork == network_btc) {
                  navigate('SendBtcPage');
                } else if (netWork == network_all) {
                  navigate('SendSelectAssertPage');
                }
              }}
            >
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Image
                  source={require('../../image/meta_home_send_icon.png')}
                  style={{ width: 40, height: 40 }}
                />
                <Text style={[{ marginTop: 10 }, metaStyles.smallDefaultText]}>
                  {t('h_send')}
                  {/* {t('welcome')} */}
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                // changeLanguage()
                if (netWork == network_mvc) {
                  navigate('ReceivePage', { myCoinType: 'SPACE' });
                } else if (netWork == network_btc) {
                  navigate('ReceivePage', { myCoinType: 'BTC' });
                } else if (netWork == network_all) {
                  navigate('SelectReceivePage');
                }
              }}
            >
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <Image
                  source={require('../../image/meta_home_receive_icon.png')}
                  style={{ width: 40, height: 40 }}
                />
                <Text style={[{ marginTop: 10 }, metaStyles.smallDefaultText]}>
                  {t('h_receive')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            {/* 
          <TouchableWithoutFeedback
            onPress={() => {
              console.log("click");
            }}
          >
            <View style={{ marginTop: 20 }}>
              <Image
                source={require("../../image/meta_home_record_icon.png")}
                style={{ width: 40, height: 40 }}
              />
              <Text style={[{ marginTop: 10 }, metaStyles.smallDefaultText]}>
                Record
              </Text>
            </View>
          </TouchableWithoutFeedback> */}

            {isShowPay == showPayCode &&
              (walletMode == wallet_mode_hot || walletMode == undefined) && (
                <TouchableWithoutFeedback
                  onPress={async () => {
                    // updateAccountIndex(1);
                    // AsyncStorageUtil.setItem("account_select", 0);

                    navigate('WebsPage', {
                      url: 'https://app.orders.exchange/',
                    });

                    // navigate("DiscoverPage");
                    // navigate("WebPageTest");
                  }}
                >
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Image
                      source={require('../../image/meta_home_swap_icon.png')}
                      style={{ width: 40, height: 40 }}
                    />
                    <Text style={[{ marginTop: 10 }, metaStyles.smallDefaultText]}>
                      {t('h_swap')}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )}

            {isShowPay == showPayCode &&
              (walletMode == wallet_mode_hot || walletMode == undefined) && (
                <TouchableWithoutFeedback
                  onPress={async () => {
                    // navigate("DiscoverPage");

                    navigate('WebsPage', {
                      // url: "https://octopus.space/",
                      url: 'https://octopus.space/#/wrapping',
                    });
                    // navigate("WebPageTest");
                    // navigate("WebPage");
                  }}
                >
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Image
                      source={require('../../image/meta_home_bridge_icon.png')}
                      style={{ width: 40, height: 40 }}
                    />
                    <Text style={[{ marginTop: 10 }, metaStyles.smallDefaultText]}>
                      {t('h_bridge')}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )}
          </View>

          {/* <MyTabs /> */}
          {/* {[network_all].includes(netWork) && <MyTabs01 />}
        {[, network_btc].includes(netWork) && <MyTabs02 />}
        {[, network_mvc].includes(netWork) && <MyTabs03 />} */}

          {netWork == network_all && <MyTabs01 />}

          {netWork == network_btc && <MyTabs02 />}

          {netWork == network_mvc && <MyTabs03 />}
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
      <TabsTop.Screen name="Assets" options={{ title: 'Assets' }} component={AssetsPage} />
      <TabsTop.Screen name="FT" options={{ title: 'FTs' }} component={FtPage} />
      <TabsTop.Screen name="NFT" options={{ title: 'NFTs' }} component={NftPage} />
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
      <TabsTop.Screen name="Crypto" options={{ title: 'Crypto' }} component={AssetsPage} />

      <TabsTop.Screen name="FT1" options={{ title: 'FTs' }} component={FtParentPage} />
      <TabsTop.Screen name="NFT1" options={{ title: 'NFTs' }} component={NftParentPage} />

      <TabsTop.Screen name="MetaID1" options={{ title: 'PIN' }} component={MetaIDPage} />
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
      <TabsTop.Screen name="Crypto" options={{ title: 'Crypto' }} component={AssetsPage} />

      <TabsTop.Screen name="FT2" options={{ title: 'FTs' }} component={FtBtcPage} />
      <TabsTop.Screen name="NFT2" options={{ title: 'NFTs' }} component={NftBtcPage} />
      <TabsTop.Screen name="MetaID2" options={{ title: 'PIN' }} component={MetaIDPage} />
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
      <TabsTop.Screen name="Crypto3" options={{ title: 'Crypto' }} component={AssetsPage} />

      <TabsTop.Screen name="FT3" options={{ title: 'FTs' }} component={FtMvcPage} />
      <TabsTop.Screen name="NFT3" options={{ title: 'NFTs' }} component={NftMvcPage} />
      <TabsTop.Screen name="MetaID3" options={{ title: 'PIN' }} component={MetaIDPage} />
    </TabsTop.Navigator>
  );
}

// useEffect(() => {
//   if (!walletManager) {
//     return;
//   }

//   const initWalletManager = async () => {
//     try {
//       const mode = await AsyncStorageUtil.getItem(wallet_mode_key);
//       if (!mode || wallet_mode_cold != mode) {
//         // console.log("initWalletManager");
//         // const t1 = performance.now();
//         getCurrentChainWallet(Chain.BTC).then((btcWallet) => {
//           // updateBtcAddress(btcWallet.getAddress());
//           console.log(btcWallet.getAddress());

//           // console.log("time1", performance.now() - t1);
//           // console.log("btc address", btcWallet.getAddress());
//         });
//         getCurrentChainWallet(Chain.MVC).then((mvcWallet) => {
//           // console.log("mvc walletManager ",mvcWallet.getAddress());
//           // console.log("mvc walletManager ",mvcWallet.getAddressIndex());
//           // console.log("mvc walletManager ",mvcWallet.getAddressType());
//           // console.log("mvc walletManager ",mvcWallet.getScriptType());
//           // console.log("mvc walletManager ",mvcWallet.getPath());
//           // console.log("mvc walletManager ",mvcWallet.getSeed().toString('hex'));
//           // updateMvcAddress(mvcWallet.getAddress());
//           // console.log("time2", performance.now() - t1);
//           // console.log("mvc address", mvcWallet.getAddress());
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   initWalletManager();
// }, [walletManager]);
