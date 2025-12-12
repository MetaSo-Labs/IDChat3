import { View, Text, TouchableWithoutFeedback, Image, FlatList, StyleSheet } from 'react-native';
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
import { grayNormalColor, metaStyles, normalColor } from '@/constant/Constants';
import { getCurrentWallet } from '@/lib/wallet';
import { Chain } from '@metalet/utxo-wallet-sdk';
import { fetchUtxos, MvcUtxo } from '@/queries/utxos';
import { getDefaultMVCTRate } from '@/queries/transaction';
import { API_NET, API_TARGET, FtManager, Wallet } from 'meta-contract';
import {
  formatToDecimal,
  getStorageCurrentWallet,
  getWalletNetwork,
  isObserverWalletMode,
} from '@/utils/WalletUtils';
import Toast from 'react-native-toast-message';
import { getIconUri } from '@mvc-org/mvc-resources';
import { goBack, navigate } from '@/base/NavigationService';
import { MvcFtData } from '@/api/type/MvcFtData';
import { getCurrentMvcWallet } from '@/wallet/wallet';
import { fetchMvcFtBalance, fetchMvcFtPrice } from '@/api/metaletservice';
import { caculateOneFtValue } from '@/utils/AssertUtils';

export default function MergeFtPage(props) {
  const { mvcAddress, updateMvcAddress } = useData();
  const [utxosNumber, setUtxosNumber] = useState(0);
  const { metaletWallet, updateMetaletWallet } = useData();
  const isOpenResultModal = useRef(false);
  const NeedToMergeCount = 3;

  let [ftList, setftList] = useState<MvcFtData[]>();

  useEffect(() => {
    refresh();
  }, []);

  async function getUtxos() {
    const address = await getCurrentWallet(Chain.MVC).getAddress();
    const utxos = await fetchUtxos(Chain.MVC, address);
    setUtxosNumber(utxos.length);
  }

  async function merge(genesis: string, codehash: string) {
    const privateKey: string = metaletWallet.currentMvcWallet.getPrivateKey();
    // const wallet = new Wallet(priviteKey, API_NET.MAIN, 1, API_TARGET.MVC);
    const network = await getWalletNetwork();
    const feed = await getDefaultMVCTRate();
    const ftManager = new FtManager({
      network: network === 'mainnet' ? API_NET.MAIN : API_NET.TEST,
      purse: privateKey,
      feeb: Number(feed),
      apiTarget: API_TARGET.APIMVC,
      // apiTarget: API_TARGET.MVC,
    });

    const { txids } = await ftManager
      .totalMerge({
        genesis,
        codehash,
        ownerWif: privateKey,
      })
      .catch((e) => {
        ToastView({ text: e.message, type: 'error' });
        throw e;
      });

    console.log('merge txids ', txids);
    ToastView({ text: 'merge successful', type: 'info' });
    refresh();
  }

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

    console.log(ftdata);

    if (list) {
      setftList([...list]);
    } else {
      setftList([]);
    }
    
  }

  const refreshData = (id) => {
    setftList((prevList) =>
      prevList.map((item) => (item.name === id ? { ...item, imageError: true } : item)),
    );
  };

  const ListItem = ({ index, item }) => {
    // let ImageUrl = getShowImageUrl(item.icon!);
    let ImageUrl = getIconUri({
      type: 'metaContract',
      codehash: item.codeHash,
      genesis: item.genesis,
    });
    if (!ImageUrl) {
      ImageUrl = '1';
    }

    //  const resut=await checkImage(ImageUrl)
    //  setICanLoadImage(resut)
    return (
      // {NeedToMergeCount < item.utxoCount && (

      //   )}

      NeedToMergeCount < item.utxoCount && item.unconfirmed != 0 ? (
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
            <Text style={{ fontSize: 16, color: '#000000', marginBottom: 10 }}>
              {item.symbol.toUpperCase()}
            </Text>
            {/* <Text style={metaStyles.grayTextSmall66}>{item.name}</Text> */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: grayNormalColor,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                UTXO Count : {item.utxoCount}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1 }} />
          <TouchableWithoutFeedback
            onPress={() => {
              merge(item.genesis, item.codeHash);
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(23, 26, 255, 0.1)',
                padding: 5,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 15,
                width: 70,
              }}
            >
              <Text
                style={{
                  color: normalColor,
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                Merge
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : (
        <View />
      )
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View style={{ flex: 1, margin: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 25 }}>FT Merge</Text>
          <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10 }}>
            Due to the technical characteristics of UTXO, when there are too many UTXOs for a
            certain token, problems such as transaction failure loops may occur. The merging tool
            will automatically assist you in consolidating scattered UTXOs into one.
          </Text>

          <Text style={{ fontSize: 18, marginTop: 20 }}>MVC (Bitcoin side chain)</Text>
          <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10 }}>{mvcAddress}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 16, color: normalColor, marginTop: 15 }}>Token</Text>
          </View>

          <View>
            <FlatList
              data={ftList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
            />
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
