import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AvatarImageView,
  CloseView,
  Line,
  LoadingModal,
  NormalAlertView,
  QRScanner,
  TitleBar,
  VerifyModal,
} from '@/constant/Widget';
import { metaStyles, themeColor } from '@/constant/Constants';
import Constants from 'expo-constants';
import { navigate } from '@/base/NavigationService';
import useNetworkStore from '@/stores/useNetworkStore';
import { getRandomID, setWalletNetwork } from '@/utils/WalletUtils';
import {
  AsyncStorageUtil,
  wallet_language_key,
  wallet_mode_cold,
  wallet_mode_hot,
  wallet_mode_observer,
} from '@/utils/AsyncStorageUtil';
import { useTranslation } from 'react-i18next';
import i18n from '@/language/i18n';
import { AddressType } from '@metalet/utxo-wallet-sdk';
import { useData } from '@/hooks/MyProvider';
import { useFocusEffect } from '@react-navigation/native';
import useUserStore from '@/stores/useUserStore';
import { getMetaIDUserImageUrl, getUserMetaIDInfo, isRegisterMetaID } from '../com/metaIDUtils';
import { getCurrentMvcWallet } from '@/wallet/wallet';
import { UerMetaIDInfo } from '@/api/type/UserMetaIDinfoBean';
import { isNotEmpty } from '@/utils/StringUtils';
import { eventBus, logout_Bus } from '@/utils/EventBus';

export const BTC_NETWORK = 'mainnet';
export const BTC_NETWORK_TEST = 'testnet';

export default function ChatSettingsPage(props: any) {
  const [isShowVerify, setIsShowVerify] = useState(false);
  const [isShowNetwork, setShowNetwork] = useState(false);
  const [isLanguage, setIsLanguage] = useState(false);
  const { network, switchNetwork } = useNetworkStore();
  const [isShowLoading, setIsShowLoading] = useState(false);
  // const { needRefreshHome, updateNeedRefreshHome } = useData();
  const { needInitWallet, updateNeedInitWallet } = useData();
  const { walletMode, updateWalletMode } = useData();
  const [isScan, setIsScan] = useState(false);
  const [isDisclaimer, setIsDisclaimer] = useState(false);
  const { walletLanguage, updateWalletLanguage } = useData();
  const { mvcAddress, updateMvcAddress } = useData();
  const { btcAddress, updateBtcAddress } = useData();
  const { metaletWallet, updateMetaletWallet } = useData();

  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState('');
  const [isShowLogout, setIsLogout] = useState(false);
  const [userName, setUserName] = useState('');
  const [userMetaID, setUserMetaID] = useState('');

  // const currentAddressType = metaletWallet.currentBtcWallet!.getAddressType()!;
  // console.log(
  //   "addressType-----",
  //   metaletWallet.currentBtcWallet!.getAddressType()!
  // );

  useFocusEffect(
    React.useCallback(() => {
      const avatarLocalUri = useUserStore.getState().userInfo?.avatarLocalUri;
      console.log('avatarLocalUri ', avatarLocalUri);
      intUserMetaIDInfo();
      // setSelectedImage(avatarLocalUri);

      // Add event listener for back button press
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp();
        return true;
      });
      // Clean up the event listener when the screen is unfocused or component unmounts
      return () => backHandler.remove();
    }, []),
  );

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // console.log("Home page is focused");
  //     console.log('walletMid==', walletMode);

  //     // Add event listener for back button press
  //     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //       BackHandler.exitApp();
  //       return true;
  //     });
  //     // Clean up the event listener when the screen is unfocused or component unmounts
  //     return () => backHandler.remove();
  //   }, []),
  // );

  useEffect(() => {
    intUserMetaIDInfo();
  }, []);

  async function intUserMetaIDInfo() {
    if (isRegisterMetaID()) {
      const metaIDInfo: UerMetaIDInfo = await getUserMetaIDInfo();
      if (isNotEmpty(metaIDInfo.name)) {
        setUserName(metaIDInfo.name);
        useUserStore.getState().setUserInfo({ name: metaIDInfo.name, nameId: metaIDInfo.nameId });
      }
      if (isNotEmpty(metaIDInfo.avatar)) {
        setSelectedImage(getMetaIDUserImageUrl(metaIDInfo.avatar));
      }

      if (isNotEmpty(metaIDInfo.metaid)) {
        setUserMetaID(metaIDInfo.metaid.slice(0, 6));
      }
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoadingModal
        isShow={isShowLoading}
        isCancel={true}
        event={() => {
          setIsShowLoading(false);
        }}
      />

      <NormalAlertView
        isShow={isShowLogout}
        title={t('chat_settings_logout')}
        message={t('chat_logout_notice')}
        onConfirm={() => {
          
          setIsLogout(false);
          useUserStore.getState().clearUserInfo();
          eventBus.publish(logout_Bus, { data: '' });
          navigate('SplashPage');
        }}
        onCancel={() => {
          setIsLogout(false);
        }}
      />

      {isScan ? (
        <QRScanner
          handleScan={(data) => {
            setIsScan(false);
            console.log(data);
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                marginTop: 20,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  marginTop: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* <AvatarImageView size={80} source={selectedImage!=null?{uri:selectedImage}:require('@image/avatar_default_icon.png')} /> */}
                <AvatarImageView
                  size={80}
                  source={
                    selectedImage === ''
                      ? require('@image/avatar_default_icon.png')
                      : {
                          uri: selectedImage,
                        }
                  }
                />
                <Text style={[metaStyles.titleText, { marginTop: 10 }]}> {userName}</Text>
                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                  <Text style={[{ color: '#909399', fontSize: 13 }]}>{'MetaID'}</Text>
                  <Text style={[{ color: '#909399', fontSize: 13, marginLeft: 3 }]}>
                    {userMetaID}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableWithoutFeedback
              onPress={() => {
                navigate('ChatWalletPage');
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                }}
              >
                <Image
                  source={require('@image/chat_me_wallet_icon.png')}
                  style={{ width: 30, height: 30 }}
                />
                <Text style={{ marginLeft: 10, color: '#303133', fontSize: 16 }}>
                  {t('chat_settings_my_wallet')}
                </Text>
                <View style={{ flex: 1 }} />
                <Image
                  source={require('@image/list_icon_ins.png')}
                  style={{ width: 20, height: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
            <View
              style={{ width: '100%', height: 0.5, backgroundColor: 'rgba(191, 194, 204, 0.5)' }}
            />
            <TouchableWithoutFeedback
              onPress={() => {
                navigate('PeoEditInfoPage');
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                }}
              >
                <Image
                  source={require('@image/chat_me_edit_icon.png')}
                  style={{ width: 30, height: 30 }}
                />
                <Text style={{ marginLeft: 10, color: '#303133', fontSize: 16 }}>
                  {t('chat_settings_edit_profile')}
                </Text>
                <View style={{ flex: 1 }} />
                <Image
                  source={require('@image/list_icon_ins.png')}
                  style={{ width: 20, height: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                navigate('LocalChatSettingsPage');
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                }}
              >
                <Image
                  source={require('@image/chat_me_settings_icon.png')}
                  style={{ width: 30, height: 30 }}
                />
                <Text style={{ marginLeft: 10, color: '#303133', fontSize: 16 }}>
                  {t('chat_settings_settings')}
                </Text>
                <View style={{ flex: 1 }} />
                <Image
                  source={require('@image/list_icon_ins.png')}
                  style={{ width: 20, height: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={() => {
                setIsLogout(true);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                }}
              >
                <Image
                  source={require('@image/chat_me_logout_icon.png')}
                  style={{ width: 30, height: 30 }}
                />
                <Text style={{ marginLeft: 10, color: '#303133', fontSize: 16 }}>
                  {t('chat_settings_logout')}
                </Text>
                <View style={{ flex: 1 }} />
                <Image
                  source={require('@image/list_icon_ins.png')}
                  style={{ width: 20, height: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
