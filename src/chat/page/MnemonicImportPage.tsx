// // MnemonicInput.tsx
// import React, { useRef, useState } from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Keyboard,
//   Button,
//   Alert,
//   NativeSyntheticEvent,
//   TextInputKeyPressEventData,
// } from 'react-native';
// import * as Clipboard from 'expo-clipboard';

// const WORD_COUNT = 12;

// export default function MnemonicInputPage() {
//   const [words, setWords] = useState<string[]>(Array(WORD_COUNT).fill(''));
//   const inputsRef = useRef<Array<TextInput | null>>([]);

//   // 当用户在某个框输入或粘贴文本时
//   const handleChangeText = (text: string, index: number) => {
//     // 不立即 trim 所有空格，用来判断用户是否粘贴了包含空格的字符串
//     const raw = text;
//     // 如果输入中包含空白（空格或换行等），认为用户可能粘贴或敲了空格分隔词
//     if (/\s/.test(raw)) {
//       const parts = raw.trim().split(/\s+/);
//       // 如果是多词（粘贴整串或包含多个单词），从当前 index 开始往后填充
//       if (parts.length > 1) {
//         const newWords = [...words];
//         for (let i = 0; i < parts.length && index + i < WORD_COUNT; i++) {
//           newWords[index + i] = parts[i];
//         }
//         setWords(newWords);
//         // focus 到最后填充的下一个位置（或末位）
//         const nextIndex = Math.min(index + parts.length, WORD_COUNT - 1);
//         setTimeout(() => inputsRef.current[nextIndex]?.focus(), 50);
//         return;
//       } else {
//         // 只有一个单词但末尾有空格（用户在单词后按了空格）
//         const token = parts[0] || '';
//         const newWords = [...words];
//         newWords[index] = token;
//         setWords(newWords);
//         if (index < WORD_COUNT - 1) {
//           setTimeout(() => inputsRef.current[index + 1]?.focus(), 50);
//         } else {
//           Keyboard.dismiss();
//         }
//         return;
//       }
//     }

//     // 普通输入：只更新当前框，不自动跳转
//     const newWords = [...words];
//     newWords[index] = raw.trim(); // 保持存储为无前后空格的单词
//     setWords(newWords);
//   };

//   // 键盘按键处理：Backspace / Enter 等
//   const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
//     const key = e.nativeEvent.key;
//     if (key === 'Backspace') {
//       // 如果当前框为空，则跳回上一个框（并把光标放到上一个末尾）
//       if (!words[index] && index > 0) {
//         const prevIndex = index - 1;
//         inputsRef.current[prevIndex]?.focus();
//         // 把光标放到上一个输入末尾（尽量兼容）
//         const prevWord = words[prevIndex] || '';
//         setTimeout(() => {
//           try {
//             // setNativeProps 可能在某些 RN 版本上可用，用 any 防止类型报错
//             (inputsRef.current[prevIndex] as any)?.setNativeProps?.({
//               selection: { start: prevWord.length, end: prevWord.length },
//             });
//           } catch (err) {
//             // 无害的兜底
//           }
//         }, 50);
//       }
//     } else if (key === ' ' || key === 'Enter') {
//       // 如果用户敲空格或回车，跳到下一个框（方便输入）
//       if (index < WORD_COUNT - 1) {
//         inputsRef.current[index + 1]?.focus();
//       } else {
//         Keyboard.dismiss();
//       }
//     }
//   };

//   // 一键粘贴剪贴板中的助记词（按钮）
//   const handlePasteAll = async () => {
//     const text = await Clipboard.getStringAsync();
//     if (!text) {
//       Alert.alert('提示', '剪贴板为空');
//       return;
//     }
//     const parts = text.trim().split(/\s+/);
//     if (parts.length < 2) {
//       Alert.alert('提示', '剪贴板内容不是助记词或只有一个词');
//       return;
//     }
//     const newWords = Array(WORD_COUNT).fill('');
//     parts.slice(0, WORD_COUNT).forEach((w, i) => (newWords[i] = w));
//     setWords(newWords);
//     Keyboard.dismiss();
//   };

//   const handleSubmit = () => {
//     const incomplete = words.some((w) => !w);
//     if (incomplete) {
//       Alert.alert('提示', `请填写完整的 ${WORD_COUNT} 个助记词`);
//       return;
//     }
//     Alert.alert('成功', `助记词：\n${words.join(' ')}`);
//   };

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.container}>
//         {words.map((word, index) => (
//           <TextInput
//             key={index}
//             ref={(ref) => {
//               inputsRef.current[index] = ref;
//             }}
//             style={styles.input}
//             value={word}
//             onChangeText={(text) => handleChangeText(text, index)}
//             onKeyPress={(e) => handleKeyPress(e, index)}
//             autoCapitalize="none"
//             autoCorrect={false}
//             placeholder={`${index + 1}`}
//             returnKeyType="next"
//             // keyboardType="default"
//           />
//         ))}
//       </View>

//       <View style={styles.buttons}>
//         <View style={{ marginBottom: 8 }}>
//           <Button title="📋 粘贴整串助记词" onPress={handlePasteAll} />
//         </View>
//         <Button title="✅ 确认导入" onPress={handleSubmit} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   input: {
//     width: '28%',
//     height: 44,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     margin: 6,
//     fontSize: 16,
//     textAlign: 'center',
//     backgroundColor: '#fafafa',
//   },
//   buttons: {
//     // 简单布局
//   },
// });

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Keyboard,
  Button,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ScrollView,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { grayNormalColor, inputNormalBgColor, metaStyles } from '@/constant/Constants';
import { CloseView, LoadingModal, RoundSimButton, TitleBar } from '@/constant/Widget';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBack, navigate } from '@/base/NavigationService';



// const WORD_COUNT = 100;

export default function MnemonicInputPage() {
  const [WORD_COUNT, setWordCount] = useState(12);

  const [words, setWords] = useState<string[]>(Array(WORD_COUNT).fill(''));
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const lastKeyRef = useRef<string>('');
  const { t } = useTranslation();
  const [isShowWord, setIsShowWord] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);

  // 每次切换助记词数量时重置输入框
  useEffect(() => {
    setWords(Array(WORD_COUNT).fill(''));
    inputsRef.current = [];
  }, [WORD_COUNT]);

  // 🔹 输入/粘贴逻辑
  const handleChangeText = (text: string, index: number) => {
    const raw = text.trimStart();

    if (/\s/.test(raw)) {
      const parts = raw.trim().split(/\s+/);
      const newWords = [...words];
      for (let i = 0; i < parts.length && index + i < WORD_COUNT; i++) {
        newWords[index + i] = parts[i];
      }
      setWords(newWords);
      const nextIndex = Math.min(index + parts.length, WORD_COUNT - 1);
      setTimeout(() => inputsRef.current[nextIndex]?.focus(), 80);
      return;
    }

    const newWords = [...words];
    newWords[index] = raw;
    setWords(newWords);
  };

  // 🔹 键盘事件逻辑
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const key = e.nativeEvent.key;

    if (key === lastKeyRef.current && key === 'Backspace') return;
    lastKeyRef.current = key;

    if (key === 'Backspace') {
      if (!words[index] && index > 0) {
        const prev = index - 1;
        inputsRef.current[prev]?.focus();
      }
    } else if (key === ' ' || key === 'Enter') {
      if (index < WORD_COUNT - 1) {
        inputsRef.current[index + 1]?.focus();
      } else {
        Keyboard.dismiss();
      }
    }
  };

  // 🔹 一键粘贴全部
  const handlePasteAll = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) return Alert.alert('提示', '剪贴板为空');
    const parts = text.trim().split(/\s+/);
    if (parts.length < 2) return Alert.alert('提示', '剪贴板内容不是有效助记词');
    const newWords = Array(WORD_COUNT).fill('');
    parts.slice(0, WORD_COUNT).forEach((w, i) => (newWords[i] = w));
    setWords(newWords);
    Keyboard.dismiss();
  };

  // 🔹 确认导入
  const handleSubmit = () => {
    if (words.some((w) => !w.trim())) {
      Alert.alert('提示', `请填写完整 ${WORD_COUNT} 个助记词`);
      return;
    }
    Alert.alert('成功', words.join(' '));
  };

  //   const OpenModal = async () => {
  //     if (!mnemonic) {
  //       return;
  //     }

  //     setObj({ ...obj, isShow: true });

  //     //wallet
  //     let walletName;
  //     let walletID = Math.random().toString(36).substr(2, 8);
  //     let wallet_addressType = AddressType.SameAsMvc;

  //     //account
  //     let accountName = 'Account 1';
  //     let accountID = Math.random().toString(36).substr(2, 8);
  //     let accountAddressIndex = 0;

  //     const hasNoWallets = await isNoStorageWallet();
  //     const wallets = await getStorageWallets();

  //     if (hasNoWallets) {
  //       //new
  //       walletName = 'Wallet 1';
  //       console.log('new');
  //     } else {
  //       //add
  //       console.log('add');

  //       walletName = 'Wallet ' + (wallets.length + 1);
  //     }

  //     console.log('初始创建的路径是： ' + mvcPath);
  //     const network = await getWalletNetwork();

  //     let walletBean: WalletBean = {
  //       id: walletID,
  //       name: walletName,
  //       mnemonic,
  //       mvcTypes: parseInt(mvcPath),
  //       isOpen: true,
  //       addressType: wallet_addressType,
  //       isBackUp: false,
  //       isCurrentPathIndex: 0,
  //       seed: '',
  //       isColdWalletMode: type,
  //       accountsOptions: [
  //         {
  //           id: accountID,
  //           name: accountName,
  //           addressIndex: accountAddressIndex,
  //           isSelect: true,
  //           defaultAvatarColor: getRandomColorList(),
  //         },
  //       ],
  //     };

  //     const btcWallet = new BtcWallet({
  //       network: network == 'mainnet' ? 'mainnet' : 'testnet',
  //       mnemonic: walletBean.mnemonic,
  //       addressIndex: walletBean.accountsOptions[0].addressIndex,
  //       addressType: walletBean.addressType,
  //       coinType: CoinType.BTC,
  //     });

  //     const seed = btcWallet.getSeed();
  //     const saveSeed = seed.toString('hex');
  //     console.log('saveSeed', saveSeed);
  //     walletBean.seed = saveSeed;

  //     const mvcWallet = new MvcWallet({
  //       network: network == 'mainnet' ? 'mainnet' : 'testnet',
  //       mnemonic: walletBean.mnemonic,
  //       addressIndex: walletBean.accountsOptions[0].addressIndex,
  //       addressType: AddressType.LegacyMvc,
  //       coinType: walletBean.mvcTypes,
  //       seed,
  //     });

  //     updateMvcAddress(mvcWallet.getAddress());
  //     updateBtcAddress(btcWallet.getAddress());
  //     let metaletWallet = new MetaletWallet();
  //     metaletWallet.currentBtcWallet = btcWallet;
  //     metaletWallet.currentMvcWallet = mvcWallet;
  //     updateMetaletWallet(metaletWallet);
  //     // const updataWallets=[...value,walletBean]
  //     if (hasNoWallets) {
  //       await storage.set(wallets_key, [walletBean]);
  //     } else {
  //       console.log('refresh');
  //       const newWallets = [...wallets, walletBean];
  //       await storage.set(wallets_key, newWallets);
  //       updateNeedInitWallet(getRandomID());
  //     }
  //     // const updataWallets = addWallet(wallets, walletBean);
  //     updateMyWallet(walletBean);

  //     await storage.set(CurrentWalletIDKey, walletBean.id);
  //     await storage.set(CurrentAccountIDKey, walletBean.accountsOptions[0].id);

  //     setObj({ ...obj, isShow: false });

  //     navigate('ImportWalletNetWorkPage');
  //   };

  return (
    <SafeAreaView key={WORD_COUNT} style={styles.wrapper}>
    

      <Modal visible={isShowWord} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {[
              { label: '12 words', value: 12 },
              { label: '15 words', value: 15 },
              { label: '18 words', value: 18 },
              { label: '24 words', value: 24 },
            ].map((opt) => (
              <TouchableWithoutFeedback
                key={opt.value}
                onPress={() => {
                  setIsShowWord(false);
                  setWordCount(opt.value);
                }}
              >
                <View style={styles.modalItem}>
                  <Text style={{ fontSize: 18, color: '#333' }}>{opt.label}</Text>
                  {WORD_COUNT === opt.value && (
                    <Image
                      source={require('@image/wallets_select_icon.png')}
                      style={{ width: 20, height: 20 }}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            ))}
          </View>
        </View>
      </Modal>

      <View style={styles.wrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableWithoutFeedback
            onPress={() => {
              goBack();
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 20,
                marginTop: 5,
                height: 44,
                alignItems: 'center',
                // alignContent: 'space-between',
                justifyContent: 'space-between',
              }}
            >
              <Image
                source={require('@image/meta_back_icon.png')}
                style={{ width: 22, height: 22 }}
              />
            </View>
          </TouchableWithoutFeedback>

          <Text
            style={[{ textAlign: 'center', marginRight: 40, marginLeft: 15 }, metaStyles.titleText]}
          >
            Import Wallet
          </Text>

          <View style={{ flex: 1 }}></View>
          <TouchableWithoutFeedback
            onPress={() => {
              setIsShowWord(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('@image/wallets_close_icon.png')}
                style={{ width: 13, height: 13, marginLeft: 30 }}
              />
              <Text style={{ marginRight: 20, color: '#333', fontSize: 16 }}>
                {' '}
                {WORD_COUNT} word
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <ScrollView style={{ flex: 1, marginBottom: 20 }}>
          <View>
            <View style={styles.container}>
              {words.map((word, i) => (
                <View key={`${WORD_COUNT}-${i}`} style={styles.inputRow}>
                  <Text style={styles.indexText}>{i + 1}</Text>
                  <TextInput
                    ref={(ref) => {
                      inputsRef.current[i] = ref;
                    }}
                    style={styles.input}
                    value={word}
                    onChangeText={(text) => handleChangeText(text, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <RoundSimButton
            title={t('c_confirm')}
            event={() => {
              // console.log('click confirm');
            }}
          />
        </View>
        {/* <View style={styles.buttons}>
        <View style={{ marginBottom: 8 }}>
          <Button title="📋 粘贴整串助记词" onPress={handlePasteAll} />
        </View>
        <Button title="✅ 确认导入" onPress={handleSubmit} />
      </View>
       */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '42%', // 让每行大约两个
    marginVertical: 6,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  indexText: {
    width: 20,
    textAlign: 'center',
    marginRight: 6,
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#EDEFF2',
    height: '100%',
    // borderRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    textAlignVertical: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 3,
    fontSize: 16,
    textAlign: 'center',
  },
  buttons: {
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: '#fff', borderRadius: 10, margin: 30, padding: 20 },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
});
