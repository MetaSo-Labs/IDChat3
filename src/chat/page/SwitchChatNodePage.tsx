import {
  View,
  Text,
  TouchableWithoutFeedback,
  Image,
  FlatList,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CircleAvatar,
  CircleAvatarLetter,
  RoundSimButton,
  TitleBar,
  ToastView,
} from '@/constant/Widget';
import WebView from 'react-native-webview';
import { useData } from '@/hooks/MyProvider';
import { grayNormalColor, metaStyles, normalColor, themeColor } from '@/constant/Constants';
import { getCurrentWallet } from '@/lib/wallet';
import { Chain } from '@metalet/utxo-wallet-sdk';
import { fetchUtxos, MvcUtxo } from '@/queries/utxos';
import { getDefaultMVCTRate } from '@/queries/transaction';
import { API_NET, API_TARGET, FtManager, Wallet } from 'meta-contract';
import {
  formatToDecimal,
  getRandomID,
  getRandomNum,
  getStorageCurrentWallet,
  getWalletNetwork,
  isObserverWalletMode,
} from '@/utils/WalletUtils';
import Toast from 'react-native-toast-message';
import { getIconUri } from '@mvc-org/mvc-resources';
import { goBack, navigate, reSets } from '@/base/NavigationService';
import { MvcFtData } from '@/api/type/MvcFtData';
import { getCurrentMvcWallet } from '@/wallet/wallet';
import { fetchChatNode, fetchMvcFtBalance, fetchMvcFtPrice } from '@/api/metaletservice';
import { caculateOneFtValue } from '@/utils/AssertUtils';
import { ChatNode } from '@/types/ChatBean';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
// import { Checkbox } from 'react-native-paper';
import Checkbox from 'expo-checkbox';
import { useTranslation } from 'react-i18next';
import { AsyncStorageUtil, CHAT_NODE_KEY } from '@/utils/AsyncStorageUtil';
import { isNotEmpty } from '@/utils/StringUtils';

export default function SwitchChatNodePage(props) {
  const { mvcAddress, updateMvcAddress } = useData();
  const { chatNodeNow, updateChatNodeNow } = useData();
  const [utxosNumber, setUtxosNumber] = useState(0);
  const { metaletWallet, updateMetaletWallet } = useData();
  const { reloadWebKey, updateReloadKey } = useData();
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedLocationNode, setLocationSelectedNode] = useState(true);
  const { switchAccount, updateSwitchAccount } = useData();

  const isOpenResultModal = useRef(false);
  const NeedToMergeCount = 3;
  const { t } = useTranslation();

  let [ftList, setftList] = useState<ChatNode[]>();
  const [inputNode, setInputNode] = useState('');
  const [showNotice, setShowNotice] = useState(false);
  const { webLogout, updateWebLogout } = useData();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    // const chatNodeList=await fetchChatNode()
    // console.log(chatNodeList)
    const chatNodeList: ChatNode[] = await fetchChatNode();
    getMvcFtData(chatNodeList);
  }

  async function getMvcFtData(chatNodeList: ChatNode[]) {
    console.log('chatNodeNow', chatNodeNow);
    let list = [];
    if (chatNodeList != null) {
      const cnode = { name: 'Customize', location: '', url: '', isChoose: false };
      list.push(cnode);
      for (let i = 0; i < chatNodeList.length; i++) {
        const ftItem: ChatNode = chatNodeList[i];
        ftItem.isChoose = false;
        if (chatNodeNow.startsWith(ftItem.url)) {
          ftItem.isChoose = true;
          setLocationSelectedNode(false);
        }
        list.push(ftItem);
      }
    }

    console.log('list', list);
    if (list) {
      setftList([...list]);
    } else {
      setftList([]);
    }
  }

  async function switchChatNode() {
    if (selectedLocationNode) {
      if (isNotEmpty(inputNode)) {
        if (inputNode.startsWith('http://') || inputNode.startsWith('https://')) {
          // const rand = getRandomID();
          // console.log('随机数' + rand);
          // updateWebLogout(rand);

          await AsyncStorageUtil.setItem(CHAT_NODE_KEY, inputNode);
          updateChatNodeNow(inputNode);
          console.log('选择节点' + inputNode);
          updateReloadKey(getRandomNum());
          reSets('Tabs');
          // navigate('Tabs');
          // navigate('SplashPage');
        }
      } else {
        ToastView({ text: 'Please enter the node URL', type: 'info' });
      }
    } else {
      const rand = getRandomID();
      console.log('随机数' + rand);
      updateWebLogout(rand);
      setTimeout(async() => {
        await AsyncStorageUtil.setItem(CHAT_NODE_KEY, selectedNode);
        updateChatNodeNow(selectedNode);
        console.log('选择节点' + selectedNode);
        updateReloadKey(getRandomNum());
        navigate('Tabs');
        updateSwitchAccount(getRandomID());
      }, 1000);

      // navigate('SplashPage');
    }
  }

  const ListItem = ({ index, item }) => {
    return (
      // <TouchableWithoutFeedback
      //   onPress={() => {
      //     const newList = ftList.map((node) => ({
      //       ...node,
      //       isChoose: node.url === item.url, // 👈 只选中当前点击的
      //     }));
      //     setSelectedNode(item.url);
      //     setftList(newList);
      //   }}
      //   style={{flex: 1, marginRight: 10}}
      // >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 10,
          width: '100%',
        }}
      >
        {item.name == 'Customize' ? (
          <Checkbox
            onValueChange={() => {
              const newList = ftList.map((node) => ({
                ...node,
                isChoose: node.url === item.url, // 👈 只选中当前点击的
              }));
              setSelectedNode(item.url);
              setftList(newList);
              console.log('选择节点' + item.url);
              if (item.name == 'Customize') {
                setLocationSelectedNode(true);
              } else {
                setLocationSelectedNode(false);
              }
            }}
            value={selectedLocationNode ? true : false}
            color={themeColor}
          />
        ) : (
          <Checkbox
            onValueChange={() => {
              const newList = ftList.map((node) => ({
                ...node,
                isChoose: node.url === item.url, // 👈 只选中当前点击的
              }));
              setSelectedNode(item.url);
              setftList(newList);
              console.log('选择节点' + item.url);
              if (item.name == 'Customize') {
                setLocationSelectedNode(true);
              } else {
                setLocationSelectedNode(false);
              }
            }}
            value={item.isChoose ? true : false}
            color={themeColor}
          />
        )}

        <View style={{ marginLeft: 10, flex: 1 }}>
          {item.name == 'Customize' ? (
            <View style={{}}>
              <Text style={metaStyles.defaultText}>{item.name}</Text>
              <View
                style={{
                  borderColor: 'rgba(191, 194, 204, 0.5)',
                  flexDirection: 'row',
                  borderWidth: 1,
                  height: 43,
                  borderRadius: 10,
                  marginTop: 5,
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <TextInput
                  placeholder={selectedLocationNode ? chatNodeNow : 'Enter Your Chat Node URL'}
                  value={inputNode}
                  onChangeText={(text) => {
                    setInputNode(text);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    marginLeft: 10,
                    flex: 1,
                    // textAlignVertical: "left",
                    padding: 10,
                  }}
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={metaStyles.defaultText}>
                {item.name} ({item.location}）
              </Text>
              <Text style={{ marginTop: 10, color: grayNormalColor, marginLeft: 3 }}>
                {item.url}
              </Text>
            </View>
          )}
        </View>
      </View>
      // </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar title={t('chat_settings_switch_node')} />

        <Modal visible={showNotice} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                paddingHorizontal: 35,
                paddingTop: 35,
                paddingBottom: 33,
                width: '90%',
                maxWidth: 400,
              }}
            >
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('b_detail')}</Text>

                {/* <TouchableWithoutFeedback
                onPress={() => {
                  setShowNotice(false);
                }}
              >
                <Image
                  source={require('@image/metalet_close_big_icon.png')}
                  style={{ width: 20, height: 20, marginLeft: 'auto' }}
                />
              </TouchableWithoutFeedback> */}
              </View>
              {/* <Text style={{ fontSize: 15, color: '#333', lineHeight: 22, marginTop: 5 }}>
              {t('community_reminder_notice')}
            </Text> */}
              <Text style={{ fontSize: 15, color: '#333', lineHeight: 22, marginTop: 5 }}>
                {t('chat_switch_node_note')}{' '}
                {/* <Text style={{ fontWeight: '600' }}>{t('comm_email_us')}</Text>{' '} */}
                {/* {t('community_reminder_notice_last')} */}
              </Text>

              <TouchableOpacity
                onPress={async () => {
                  setShowNotice(false);

                  // await AsyncStorageUtil.setItem(USER_NOTICE_KEY, false);
                }}
                style={{
                  marginTop: 22,
                  backgroundColor: themeColor,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#333', fontWeight: '500', fontSize: 16 }}>
                  {t('comm_my_know')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={{ flex: 1, margin: 20, marginBottom: 30 }}>
          <View style={{ marginTop: 20 }}>
            <FlatList
              data={ftList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
            />

            <View style={{ marginHorizontal: 20, marginTop: 100 }}>
              <RoundSimButton
                title={t('c_confirm')}
                textColor="#333"
                event={() => {
                  switchChatNode();
                }}
              />
            </View>
          </View>

          <View style={{ flex: 1 }} />
          <View style={{ marginRight: 10, marginBottom: 10, alignItems: 'flex-end' }}>
            <TouchableWithoutFeedback
              onPress={() => {
                setShowNotice(true);
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: grayNormalColor,
                  marginLeft: 3,
                  textDecorationLine: 'underline',
                }}
              >
                {t('chat_switch_node')}
              </Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flatListStyle: {
    width: '100%',
    height: 100,
    backgroundColor: '#F5F7F9',
    marginTop: 10,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
