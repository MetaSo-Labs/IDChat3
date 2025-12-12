import {
  View,
  Text,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  Keyboard,
  Platform,
} from 'react-native';
import React, { use, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LoadingModal,
  LoadingNoticeModal,
  QRScanner,
  RoundSimButton,
  RoundSimButtonFlee,
  TitleBar,
  ToastView,
  VerifyModal,
  styles,
} from '../../constant/Widget';
import { grayNormalColor, inputNormalBgColor, themeColor } from '../../constant/Constants';
import { navigate } from '../../base/NavigationService';
import { useData } from '../../hooks/MyProvider';
import { Wallet, API_TARGET, API_NET } from 'meta-contract';
import { AddressType, ScriptType, Transaction } from '@metalet/utxo-wallet-service';
import { broadcastSpace, fetchMvcFeed } from '../../api/metaletservice';
import { getRandomID, getWalletNetwork, parseToSat } from '../../utils/WalletUtils';
import { getCurrentBtcWallet } from '@/wallet/wallet';
import { BtcHotWallet, SignType } from '@metalet/utxo-wallet-sdk';
import { getBtcUtxos } from '@/queries/utxos';
import { wallet_mode_cold } from '@/utils/AsyncStorageUtil';
import { useTranslation } from 'react-i18next';
import { getDefaultMVCTRate } from '@/queries/transaction';
import { FeedBean, FeedBtcObject } from '@/types/btcfeed';
import { isNotEmpty } from '@/utils/StringUtils';

export default function SendDogePage() {
  const [nextBtnColor, setNextBtnColor] = useState('rgba(23, 26, 255, 0.5)');
  const [inputAddress, setInputAddress] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [isInputAddressFcous, setIsInputAddressFcous] = useState(false);
  const [isInputAmountFcous, setIsInputAmountFcous] = useState(false);

  // 扫描
  const [isScan, setIsScan] = useState(false);

  //提示
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [noticeContent, setNoticeContent] = useState('Successful');
  const [confirmDailogState, setConfirmDailogState] = useState(false);

  // verfiy
  const [isShowVerify, setIsShowVerify] = useState(false);

  const { metaletWallet, updateMetaletWallet } = useData();

  // commfirn
  const [fee, setfee] = useState('');
  const [total, settotal] = useState('');
  const [rawTx, setrawTx] = useState('');
  const { needRefreshHome, updateNeedRefreshHome } = useData();
  const { walletMode, updateWalletMode } = useData();
  const { t } = useTranslation();

  //feed
  const [isShowFeed, setIsShowFeed] = useState(false);
  const feedModeSlow = 'Slow';
  const feedModeAvg = 'Avg';
  const feedModeFast = 'Fast';
  const feedModeCustom = 'Custom';
  const [feedModeType, setFeedModeType] = useState(feedModeAvg);
  const textInputRef = useRef(null);

  const [userSlowFeed, setSlowFeed] = useState<FeedBean>({
    title: '',
    feeRate: 10,
    desc: '',
  });
  const [userAvgFeed, setAvgFeed] = useState<FeedBean>({
    title: '',
    feeRate: 10,
    desc: '',
  });
  const [userFastFeed, setFastFeed] = useState<FeedBean>({
    title: '',
    feeRate: 10,
    desc: '',
  });

  const [feed, setFeed] = useState('5');
  const [feedReady, setFeedReady] = useState('5');

  useEffect(() => {
    getFeed();
  }, []);
  async function getFeed() {
    const feedObj: FeedBtcObject = await fetchMvcFeed();

    if (feedObj) {
      let feedList = feedObj.data.list;
      setSlowFeed(feedList[2]);
      setAvgFeed(feedList[1]);
      setFastFeed(feedList[0]);
      setFeed(feedList[1].feeRate.toString());
      setFeedReady(feedList[1].feeRate.toString());
    }
  }

  const sendSpace = async () => {
    if (inputAddress == '' || inputAmount == '') {
      return;
    }
    // let amount = Math.floor(parseFloat(inputAmount) * 100000000);

    // if (amount < 1000) {
    //   return;
    // }

    const dogeWallet = metaletWallet.currentDogeWallet;
    const hexTx = await dogeWallet.buildAndSignTx(inputAddress, Number(inputAmount));
    console.log('hexTx: ' + JSON.stringify(hexTx));
    if (isNotEmpty(hexTx)) {
      setrawTx(hexTx);
      setConfirmDailogState(true);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
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

        <Modal visible={confirmDailogState} transparent={true}>
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
                paddingTop: 30,
                marginHorizontal: 20,
              }}
            >
              {/* <Text style={{ textAlign: "center", fontSize: 16 }}>
              Confirm Transaction
            </Text> */}

              {/* 头部 */}
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../../image/doge_logo.png')}
                  style={{ width: 50, height: 50 }}
                />

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
                  {inputAmount} DOGE
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    marginTop: 15,
                    color: grayNormalColor,
                    fontSize: 14,
                  }}
                >
                  {t('c_from')}
                </Text>
                <Text style={{ marginTop: 5, color: '#333', fontSize: 14 }}>
                  {walletMode === wallet_mode_cold
                    ? ''
                    : metaletWallet.currentDogeWallet.getAddress()}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    marginTop: 10,
                    color: grayNormalColor,
                    fontSize: 14,
                  }}
                >
                  {t('c_to')}
                </Text>
                <Text style={{ marginTop: 5, color: '#333', fontSize: 14 }}>{inputAddress}</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>{t('c_amount')}</Text>
                <Text style={{ marginTop: 5, color: '#333', fontSize: 14 }}>
                  {inputAmount} DOGE
                </Text>
              </View>

              {/* <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                  {t("c_fees")}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>{fee} SPACE</Text>
              </View> */}

              {/* <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                  {t("c_total")}
                </Text>
                <Text style={{ color: "#333", fontSize: 14 }}>
                  {total} SPACE
                </Text>
              </View> */}

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  justifyContent: 'space-between',
                }}
              >
                <RoundSimButtonFlee
                  title={t('c_cancel')}
                  style={{
                    borderRadius: 10,
                    height: 40,
                    width: '45%',
                    borderWidth: 1,
                    borderColor: themeColor,
                  }}
                  color="#fff"
                  //   textColor="#171AFF"
                  textColor="#33333"
                  event={() => {
                    setConfirmDailogState(false);
                  }}
                />

                <RoundSimButtonFlee
                  title={t('c_confirm')}
                  style={{ borderRadius: 10, height: 40, width: '45%' }}
                  textColor="#33333"
                  event={() => {
                    setConfirmDailogState(false);
                    setIsShowVerify(true);
                    // OpenModal();
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* feed */}
        <Modal transparent={true} visible={isShowFeed}>
          <View
            style={{
              flex: 1,
              justifyContent: Platform.OS === 'ios' ? 'center' : 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                paddingBottom: 40,
                borderBottomLeftRadius: Platform.OS === 'ios' ? 10 : 0,
                borderBottomRightRadius: Platform.OS === 'ios' ? 10 : 0,
                marginHorizontal: Platform.OS === 'ios' ? 10 : 0,
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Select Fee Rate</Text>

                <View style={{ flex: 1 }} />

                <TouchableWithoutFeedback
                  onPress={() => {
                    setIsShowFeed(false);
                  }}
                >
                  <Image
                    source={require('../../../image/metalet_close_big_icon.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableWithoutFeedback>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeSlow);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userSlowFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor: feedModeType == feedModeSlow ? themeColor : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                    }}
                  >
                    {feedModeType == feedModeSlow && (
                      <Image
                        source={require('../../../image/fee_icon_tag.png')}
                        style={{
                          width: 13,
                          height: 13,
                          position: 'absolute',
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#333' }}>{userSlowFeed.title}</Text>
                      <Text style={{ marginTop: 3, color: '#000' }}>
                        {userSlowFeed.feeRate} sat/vB
                      </Text>
                      <Text style={{ color: '#666', fontSize: 10, marginTop: 3 }}>
                        {userSlowFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeAvg);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userAvgFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor: feedModeType == feedModeAvg ? themeColor : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                      marginLeft: 10,
                    }}
                  >
                    {feedModeType == feedModeAvg && (
                      <Image
                        source={require('../../../image/fee_icon_tag.png')}
                        style={{
                          width: 13,
                          height: 13,
                          position: 'absolute',
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#333' }}>{userAvgFeed.title}</Text>
                      <Text style={{ marginTop: 3, color: '#000' }}>
                        {userAvgFeed.feeRate} sat/vB
                      </Text>
                      <Text style={{ color: '#666', fontSize: 10, marginTop: 3 }}>
                        {userAvgFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPress={() => {
                    setFeedModeType(feedModeFast);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                    setFeedReady(userFastFeed.feeRate.toString());
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderColor: feedModeType == feedModeFast ? themeColor : inputNormalBgColor,
                      borderWidth: 0.8,
                      borderRadius: 5,
                      height: 100,
                      marginLeft: 10,
                    }}
                  >
                    {feedModeType == feedModeFast && (
                      <Image
                        source={require('../../../image/fee_icon_tag.png')}
                        style={{
                          width: 13,
                          height: 13,
                          position: 'absolute',
                          right: 0,
                        }}
                      />
                    )}

                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#333' }}>{userFastFeed.title}</Text>
                      <Text style={{ marginTop: 3, color: '#000' }}>
                        {userFastFeed.feeRate} sat/vB
                      </Text>
                      <Text style={{ color: '#666', fontSize: 10, marginTop: 3 }}>
                        {userFastFeed.desc}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>

              <TouchableWithoutFeedback
                onPress={() => {
                  setFeedModeType(feedModeCustom);
                }}
              >
                <View
                  style={{
                    borderColor: feedModeType == feedModeCustom ? themeColor : inputNormalBgColor,
                    borderWidth: 1,
                    borderRadius: 5,
                    marginTop: 20,
                    height: 'auto',
                  }}
                >
                  {feedModeType == feedModeCustom && (
                    <Image
                      source={require('../../../image/fee_icon_tag.png')}
                      style={{
                        width: 13,
                        height: 13,
                        position: 'absolute',
                        right: 0,
                      }}
                    />
                  )}
                  <View
                    style={{
                      justifyContent: 'center',
                      padding: 10,
                    }}
                  >
                    <Text>Custom Fee Rate</Text>

                    <TextInput
                      placeholder="sat/vB"
                      ref={textInputRef}
                      keyboardType={Platform.OS === 'ios' ? undefined : 'numeric'}
                      onChangeText={(text) => {
                        if (feedModeType == feedModeCustom) {
                          const numericInput = text.replace(/[^0-9]/g, '');
                          setFeedReady(numericInput);
                          // if (Platform.OS === "ios") {
                          //   Keyboard.dismiss();
                          // }
                        }
                      }}
                      value={feedReady}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                      }}
                      onFocus={() => {
                        setFeedModeType(feedModeCustom);
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback
                onPress={async () => {
                  setFeed(feedReady);
                  setIsShowFeed(false);
                }}
              >
                <View
                  style={{
                    marginTop: 20,
                    marginBottom: 20,
                    height: 20,
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={[
                      {
                        flexDirection: 'row',
                        height: 48,
                        width: '70%',
                        backgroundColor: themeColor,
                        borderRadius: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                      },
                    ]}
                  >
                    <Text style={[{ textAlign: 'center' }, { color: '#fff' }, { fontSize: 16 }]}>
                      Confirm
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>

        {/* pay verify modal */}
        <VerifyModal
          isShow={isShowVerify}
          eventCancel={() => {
            setIsShowVerify(false);
          }}
          event={async () => {
            setIsShowVerify(false);

            const txid = await metaletWallet.currentDogeWallet.broadcastTx(rawTx);
            console.log(txid);
            // console.log(message);

            if (txid != null) {
              updateNeedRefreshHome(getRandomID());

              navigate('SendDogeSuccessPage', {
                result: {
                  txid: txid,
                  chain: 'doge',
                  amount: inputAmount,
                  address: inputAddress,
                },
              });
            }
          }}
        />

        {isScan ? (
          <QRScanner
            handleScan={(data) => {
              setInputAddress('');
              setInputAddress(data);
              setIsScan(false);
            }}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <TitleBar title={t('h_send')} />

            <View
              style={{
                justifyContent: 'center',
                // backgroundColor: "#fff",
                // margin: 20,
                // borderRadius: 10,
                alignItems: 'center',
                padding: 25,
              }}
            >
              <Image
                source={require('../../../image/doge_logo.png')}
                style={{ width: 70, height: 70 }}
              />

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
                DOGE
              </Text>

              <View
                style={{
                  borderColor: isInputAddressFcous ? themeColor : 'rgba(191, 194, 204, 0.5)',
                  flexDirection: 'row',
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  marginTop: 50,
                  alignItems: 'center',
                }}
              >
                <TextInput
                  placeholder={t('c_receive_address')}
                  value={inputAddress}
                  onChangeText={(text) => {
                    setInputAddress(text);
                    if (text.length > 0 && inputAmount.length > 0) {
                      setNextBtnColor('rgba(23, 26, 255, 1)');
                    } else {
                      setNextBtnColor('rgba(23, 26, 255, 0.5)');
                    }
                  }}
                  onFocus={() => {
                    // setIsInputAddressFcous(true);
                    // setIsInputAmountFcous(false);
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

                {/* <View style={{ position: "absolute", right: 0 ,bottom: 10,}}> */}
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (isScan == false) {
                      console.log('scan');
                      setIsScan(true);
                    }
                  }}
                >
                  <Image
                    source={require('../../../image/send_scan_icon.png')}
                    style={{ width: 20, height: 20, marginRight: 10 }}
                  />
                </TouchableWithoutFeedback>
                {/* </View> */}
              </View>

              {/* 
       <View style={{flexDirection: "row", marginTop: 20,}}>
       <Text style={{ marginTop: 20, color: "#666", fontSize: 14 ,width:'100%',textAlign:'right'}}> Balance: 0.003234 SPACE</Text>
       </View> */}

              <Text
                style={{
                  marginTop: 40,
                  color: '#333',
                  fontSize: 16,
                  width: '100%',
                }}
              >
                {t('c_amount')}
              </Text>

              <View
                style={{
                  alignItems: 'center',
                  borderColor: isInputAmountFcous ? themeColor : 'rgba(191, 194, 204, 0.5)',
                  flexDirection: 'row',
                  borderWidth: 1,
                  height: 50,
                  borderRadius: 10,
                  marginTop: 10,
                }}
              >
                <TextInput
                  placeholder={metaletWallet.currentDogeBalance + ' SPACE'}
                  value={inputAmount}
                  onChangeText={(text) => {
                    const decimalPattern = /^\d*\.?\d{0,8}$/;
                    if (decimalPattern.test(text)) {
                      setInputAmount(text);
                    }
                    if (text.length > 0 && inputAddress.length > 0) {
                      setNextBtnColor('rgba(23, 26, 255, 1)');
                    } else {
                      setNextBtnColor('rgba(23, 26, 255, 0.5)');
                    }
                  }}
                  onFocus={() => {
                    // setIsInputAddressFcous(false);
                    // setIsInputAmountFcous(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    marginLeft: 10,
                    paddingRight: 10,
                  }}
                />

                <Text style={{ marginRight: 10, fontSize: 14, color: '#333' }}>DOGE</Text>
              </View>
              {/* 
              <TouchableWithoutFeedback
                onPress={() => {
                  setIsShowFeed(true);
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 30,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: grayNormalColor, fontSize: 14 }}>
                    {t("c_fee_rate")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: "#999", fontSize: 14 }}>
                    {feed} sat/vB
                  </Text>
                  <Image
                    source={require("../../../image/list_icon_ins.png")}
                    style={{ width: 18, height: 18 }}
                  />
                </View>
              </TouchableWithoutFeedback> */}

              <RoundSimButton
                title={t('c_next')}
                event={() => {
                  sendSpace();
                  // sendHotBtcTest("","tb1qqac24ca3e5vdh8fxz0kqsdjjm4zexxq8usveps",10000, 10);
                }}
                roundStytle={{ marginTop: 50 }}
                textColor="#fff"
                color={nextBtnColor}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
