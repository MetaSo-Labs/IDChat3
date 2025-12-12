import { View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RoundSimButton, TitleBar, ToastView } from '@/constant/Widget';
import WebView from 'react-native-webview';
import { useData } from '@/hooks/MyProvider';
import { grayNormalColor } from '@/constant/Constants';
import { getCurrentWallet } from '@/lib/wallet';
import { Chain } from '@metalet/utxo-wallet-sdk';
import { fetchUtxos, MvcUtxo } from '@/queries/utxos';
import { getDefaultMVCTRate } from '@/queries/transaction';
import { API_NET, API_TARGET, Wallet } from 'meta-contract';
import { getWalletNetwork } from '@/utils/WalletUtils';
import Toast from 'react-native-toast-message';
import { goBack } from '@/base/NavigationService';

export default function MergeSpacePage(props) {
  const { mvcAddress, updateMvcAddress } = useData();
  const [utxosNumber, setUtxosNumber] = useState(0);
  const { metaletWallet, updateMetaletWallet } = useData();
  const isOpenResultModal = useRef(false);

  useEffect(() => {
    getUtxos();
  }, []);

  async function getUtxos() {
    const address = await getCurrentWallet(Chain.MVC).getAddress();
    const utxos = await fetchUtxos(Chain.MVC, address);
    setUtxosNumber(utxos.length);
  }

  async function merge() {
    const priviteKey: string = metaletWallet.currentMvcWallet.getPrivateKey();
    const network = await getWalletNetwork();
    const feeb = await getDefaultMVCTRate();
    const wallet = new Wallet(
      priviteKey,
      network === 'mainnet' ? API_NET.MAIN : API_NET.TEST,
      feeb,
      API_TARGET.APIMVC,
      // API_TARGET.MVC
    );

    let { txId } = await wallet.merge().catch((err) => {
      isOpenResultModal.current = true;
      ToastView({ text: err.message, type: 'error' });
      // transactionResult.value = {
      //   status: 'warning',
      //   message: err.message,
      // };
      throw err;
    });

    console.log('merge txId ', txId);

    ToastView({ text: 'merge successful', type: 'info' });
    goBack();

    // const network: API_NET = (await getNetwork()) as API_NET;
    // const purse = currentMVCWallet.value!.getPrivateKey();
    // const feeb = await getDefaultMVCTRate();
    // const wallet = new Wallet(purse, network, feeb, API_TARGET.APIMVC);
    // let { txId } = await wallet.merge().catch((err) => {
    //   isOpenResultModal.value = true;
    //   transactionResult.value = {
    //     status: 'warning',
    //     message: err.message,
    //   };
    //   throw err;
    // });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View style={{ flex: 1, margin: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 25 }}>Space Merge</Text>
          <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10 }}>
            Due to the technical characteristics of UTXO, when there are too many UTXOs for a
            certain token, problems such as transaction failure loops may occur. The merging tool
            will automatically assist you in consolidating scattered UTXOs into one.
          </Text>

          <Text style={{ fontSize: 18, marginTop: 20 }}>MVC (Bitcoin side chain)</Text>
          <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10 }}>{mvcAddress}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10 }}>
              UTXO Count :
            </Text>
            <Text style={{ fontSize: 16, color: grayNormalColor, marginTop: 10, marginLeft: 10 }}>
              {utxosNumber}
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <RoundSimButton
            title={'Merge'}
            event={() => {
              merge();
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
