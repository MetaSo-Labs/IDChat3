import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  TextInput,
  Alert,
  Dimensions,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Touchable,
  Pressable,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingModal, TitleBar, ToastView } from '@/constant/Widget';
import { inputNormalBgColor, metaStyles, themeColor } from '@/constant/Constants';
import Constants from 'expo-constants';
import { getWalletNetwork, openBrowser } from '@/utils/WalletUtils';
import { useTranslation } from 'react-i18next';
import { getCurrentBtcWallet, getCurrentMvcWallet } from '@/wallet/wallet';
import { getCurrentWallet } from '@/lib/wallet';
import { Chain } from '@metalet/utxo-wallet-sdk';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { ActionType } from '@/webs/actions/types';

// import {
//   btcConnect,
//   IBtcConnector,
//   IMvcConnector,
//   MetaletWalletForBtc,
//   MetaletWalletForMvc,
//   mvcConnect,
// } from "@metaid/metaid";

// import { type BtcNetwork } from "@metaid/metaid/dist/service/btc";
import { getNetwork } from '@/lib/network';
// import { createBuzz } from "@feiyangl1020/metaid-create-buzz";
import * as ImagePicker from 'expo-image-picker';

// import {
//   launchImageLibrary,
//   MediaType,
// } from "react-native-image-picker";
// import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { MvcTransaction } from '@metaid/metaid';
import { AttachmentItem, BuzzOptions, MetaIdConsumer } from '@/webs/actions/lib/metaid.consumer';
import MaskedView from '@react-native-masked-view/masked-view';
import { createElement, ComponentType } from 'react';
import CheckBadgeIcon from '@/components/icons/CheckBadgeIcon';
import actionDispatcher from '@/webs/actions/action-dispatcher';
import { navigate } from '@/base/NavigationService';
import { isEmpty } from 'meta-contract/dist/scryptlib';
import { dealBtcInscribe, InscribeTxIdResult } from '@/webs/actions/lib/authorize/btc/inscribeBuzz';

export default function ShowBuzzPage() {
  const versionCode = Constants.expoConfig?.android.versionCode;
  const buildNumber = Constants.expoConfig?.ios.buildNumber;
  const platformNow = Platform.OS;
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isBitcoinNet, setBitcoinNet] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const webViewRef = useRef(null);

  const [images, setImages] = useState([]); // 存储图片 URI 的数组
  // 根据屏幕宽度计算每个图片容器的宽高，使得每行显示 3 张图片
  const { width } = Dimensions.get('window');
  const imageSize = width / 3 - 20; // 40 为左右边距及间距总和，可根据需要调整

  const [isShowSuccess, setShowSuccess] = useState(false);

  //btc buzz
  const [modalVisible, setModalVisible] = useState(false);
  const [actionName, setActionName] = useState('Inscribe');
  const [descriptions, setDescriptions] = useState([]);
  const [needEstimated, setNeedEstimated] = useState(false);
  const [isFocusEdit, setIsFocusEdit] = useState(false);
  const [componentInfo, setComponentInfo] = useState<{
    params: Record<string, unknown>;
    component: ComponentType<{
      params: object;
      ref?: React.MutableRefObject<any>;
    }>;
  }>(null);
  const metaidComponentRef = useRef<{
    getEstimatedData: () => null;
  } | null>(null);

  useEffect(() => {
    initShowBuzz();
  }, []);

  function getFileType(filePath: string): string {
    // const ext = path.extname(filePath).toLowerCase();
    console.log('filePath ', filePath);
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.svg': 'image/svg+xml',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  async function initShowBuzz() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasPermission(status === 'granted');
    // setLoading(false);
    if (status !== 'granted') {
      Alert.alert(
        'Lack of authority',
        'You need access to albums to select pictures, turn this on in Settings.',
      );
    }

    // const nowBtcWallet1=await getCurrentBtcWallet();
    // const nowMvcWallet1=await getCurrentMvcWallet();
    // console.log("nowBtcWallet1 ",nowBtcWallet1.getAddress());
    // console.log("nowMvcWallet1 ",nowMvcWallet1.getAddress());

    // const nowMvcWallet = getCurrentWallet(Chain.MVC);
    // const nowBtcWallet = getCurrentWallet(Chain.BTC);
    // console.log("nowBtcWallet  ", nowBtcWallet.getAddress());
    // console.log("nowMvcWallet  ", nowMvcWallet.getAddress());

    // const btcAddress = nowBtcWallet.getAddress();
    // const mvcAddress = nowMvcWallet.getAddress();
    // const btcPub = nowBtcWallet.getPublicKey().toString("hex");
    // const mvcPub = nowMvcWallet.getPublicKey().toString("hex");

    // let netWork = await getWalletNetwork();
    // console.log("netWork ", netWork);

    // if (netWork == "testnet") {
    //   netWork = "testnet";
    // } else {
    //   netWork = "mainnet";
    // }

    // const btcWallet = MetaletWalletForBtc.restore({
    //   address: btcAddress,
    //   pub: btcPub,
    // });
    // const mvcWallet = MetaletWalletForMvc.restore({
    //   address: mvcAddress,
    //   xpub: mvcPub,
    // });

    // const btcConnector = await btcConnect({
    //   wallet: btcWallet,
    //   network: netWork == "testnet" ? "testnet" : "mainnet",
    // });

    // const mvcConnector = await mvcConnect({
    //   wallet: mvcWallet,
    //   network: netWork == "testnet" ? "testnet" : "mainnet",
    // });

    // console.log("btcConnector ", mvcConnector.address);

    const body = { content: '下午好' };
    const metaidData = {
      operation: 'create',
      body: JSON.stringify(body),
      path: '/protocols/simplebuzz',
      contentType: 'text/plain',
    };
    // const metaidData ={
    //   body: JSON.stringify({
    //     content: "test1",
    //     contentType: "text/plain",
    //   }),
    //   path: `/protocols/simplebuzz`,
    //   operation: "create",
    // }

    // ok 的
    // const options: { network: "mainnet" } = { network: "mainnet" };
    // const metaidCon = new MetaIdConsumer();
    // const tx = metaidCon.createPin(metaidData, options);
    // console.log((await tx).txIds);

    // const buzz = await createBuzz({
    //   buzz: {
    //     content: "test",
    //     encryptContent: "",
    //     publicImages: [],
    //     encryptImages: [],
    //   },
    //   mvcConnector: mvcConnector as any,
    //   btcConnector: btcConnector as any,
    //   host: "",
    //   feeRate: 1,
    //   chain: "mvc",
    //   network: netWork == "testnet" ? "testnet" : "mainnet",
    //   serviceFee: undefined,
    // });
    // alert(JSON.stringify(buzz));

    //1.new Txcomposer()
    //2.txcomposer.addp2pkhinput(1sats)
    //3.txcomposer.addp2pkhoutput(1sats)
    //4.txcomposer.addopreturn(1sats)
    //5.txcomposer.addchangeoutput(1sats)
    //6.txcomposer.addp2pkhinput(total gas)
    //7.txcomposer.serlize()
  }

  // 读取文件为 base64，然后转为 hex
  async function getImageAsBase64(uri: string): Promise<string> {
    // 使用 FileSystem 读取文件为 base64
    console.log('uri ', uri);
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // 转为 hex 编码
    // const hexData = Buffer.from(base64Data, "base64").toString("hex");
    // console.log("hexData ", hexData);
    // return hexData;
    return base64Data;
  }

  // 读取文件为 base64，然后转为 hex
  async function getImageAsHex(uri: string): Promise<string> {
    // 使用 FileSystem 读取文件为 base64
    console.log('uri ', uri);
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // 转为 hex 编码
    const hexData = Buffer.from(base64Data, 'base64').toString('hex');
    // console.log("hexData ", hexData);
    return hexData;
  }
  const pickImage = async () => {
    console.log('进入');
    if (!hasPermission) {
      Alert.alert(
        'Insufficient permissions',
        'Unable to access the album. Please enable permissions first',
      );
      return;
    }

    if (images.length >= 1) {
      // Alert.alert("Tip", "You can only select up to 9 images");
      return;
    }
    console.log('hasPermission ', hasPermission);
    // const options = {
    //   mediaType: 'photo' as 'photo',
    //   restrictMimeTypes: ['image/jpeg', 'image/png'],
    //   selectionLimit: 1, // 图片质量（1 最高）
    // };

    // launchImageLibrary(options, (response) => {
    //   if (response.didCancel) {
    //     console.log("用户取消了选择");
    //   } else if (response.errorMessage) {
    //     console.log("ImagePicker Error:", response.errorMessage);
    //   } else {
    //     // 获取选择的图片
    //     const uri = response.assets[0].uri;
    //     setSelectedImage(uri);
    //   }
    // });

    // try {
    //   const response = await ImagePicker.openPicker({
    //     width: 300, // 设置裁剪宽度
    //     height: 400, // 设置裁剪高度
    //     cropping: true, // 启用裁剪功能
    //   });

    //   setSelectedImage(response.path);
    // } catch (error) {
    //   console.log('选择图片出错:', error);
    // }

    // try {
    //   let result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypes.Images,// 只允许选择图片
    //     allowsEditing: true,       // 允许编辑（裁剪）
    //     aspect: [4, 3],            // 裁剪时的宽高比
    //     quality: 1,                // 图片质量，1 为最高
    //   });
    //   if (!result.canceled) {
    //     setSelectedImage(result.assets[0].uri);
    //   }
    // } catch (error) {
    //   // setLoading(false);
    //   // Alert.alert('错误', '选择图片时出错，请重试');
    //   console.log('ImagePicker error:', error);
    // }

    // try {
    //   let result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ['images', 'videos'],// 只允许选择图片
    //     allowsEditing: true,       // 允许编辑（裁剪）
    //     aspect: [4, 3],            // 裁剪时的宽高比
    //     quality: 1,                // 图片质量，1 为最高
    //   });
    //   if (!result.canceled) {
    //     setSelectedImage(result.assets[0].uri);
    //   }
    // } catch (error) {
    //   // setLoading(false);
    //   // Alert.alert('错误', '选择图片时出错，请重试');
    //   console.log('ImagePicker error:', error);
    // }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        // mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result);

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setImages((prevImages) => [...prevImages, ...result.assets.map((asset) => asset.uri)]);

        // setImages((prevImages) => [
        //   ...prevImages,
        //   ...result.assets, // 👈 保存完整对象，而不是 asset.uri
        // ]);
        console.log('images ', images[0]);
      }
    } catch (error) {
      console.log('error ', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    title: {
      fontSize: 20,
      marginBottom: 20,
    },
    loader: {
      marginTop: 20,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    imageWrapper: {
      width: imageSize,
      height: imageSize,
      marginBottom: 10,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    // scrollContainer: {
    //   height: 300, // 固定高度，根据需要调整
    //   marginTop: 16,
    // },
    scrollViewContent: {
      flexGrow: 1,
    },
    imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 16,
      maxHeight: 600, // 固定高度，根据需要调整
    },
    deleteButton: {
      position: 'absolute',
      top: 5,
      right: 5,
      // backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 12,
      padding: 2,
    },
    deleteIcon: {
      width: 16,
      height: 16,
      tintColor: 'white',
    },
  });

  //  const renderItem = ({ item }) => (
  //   <Image source={{ uri: item }} style={styles.image} />
  // );
  const deleteImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };
  async function handleBuzzSubmit() {
    if (isBitcoinNet) {
      const nowBtcWallet = getCurrentWallet(Chain.BTC);
      let netWork = await getWalletNetwork();
      console.log('netWork ', netWork);
      const finalBody: any = {
        content: '测试数据555',
        contentType: 'text/plain',
      };
      if (images.length > 0) {
        const uri = images[0];
        const fileType = getFileType(uri);
        const hex = await getImageAsHex(uri);
        const paramsPic = {
          data: {
            feeRate: 2,
            revealOutValue: 546,
            metaidDataList: [
              {
                operation: 'create',
                revealAddr: nowBtcWallet.getAddress(),
                body: hex,
                path: `/file`,
                contentType: `${fileType};binary`,
                flag: 'metaid',
                version: '1.0.0',
                encoding: 'base64',
              },
            ],
            changeAddress: nowBtcWallet.getAddress(),
            service: {
              address:
                netWork == 'mainnet'
                  ? 'bc1p20k3x2c4mglfxr5wa5sgtgechwstpld80kru2cg4gmm4urvuaqqsvapxu0'
                  : 'tb1p20k3x2c4mglfxr5wa5sgtgechwstpld80kru2cg4gmm4urvuaqqsm4hfxq',
              satoshis: '1999',
            },
          },
          options: {
            noBroadcast: false,
          },
        };

        const buzzResult = (await dealBtcInscribe(paramsPic as any)) as InscribeTxIdResult;
        // console.log("buzzPicResult ", JSON.stringify(buzzResult));
        if (buzzResult.revealTxIds[0] != '') {
          const attachID = 'metafile://' + buzzResult.revealTxIds[0] + 'i0';
          finalBody.attachments = [attachID];
        }

        // fileOptions.push({
        //   // body: Buffer.from(image.data, 'hex').toString('base64'),
        //   body:hex,
        //   contentType: `${image.fileType};binary`,
        //   encoding: 'base64',
        //   flag: "metaid",
        // });

        // const imageRes=await
      }
      console.log('finalBody ', JSON.stringify(finalBody));

      const params = {
        data: {
          feeRate: 2,
          revealOutValue: 546,
          metaidDataList: [
            {
              operation: 'create',
              revealAddr: nowBtcWallet.getAddress(),
              body: JSON.stringify(finalBody),
              path: '/protocols/simplebuzz',
              contentType: 'text/plain;utf-8',
              flag: 'metaid',
              version: '1.0.0',
              encoding: 'utf-8',
            },
          ],
          changeAddress: nowBtcWallet.getAddress(),
          service: {
            address:
              netWork == 'mainnet'
                ? 'bc1p20k3x2c4mglfxr5wa5sgtgechwstpld80kru2cg4gmm4urvuaqqsvapxu0'
                : 'tb1p20k3x2c4mglfxr5wa5sgtgechwstpld80kru2cg4gmm4urvuaqqsm4hfxq',
            satoshis: '1999',
          },
        },
        options: {
          noBroadcast: false,
        },
      };

      console.log('params ', JSON.stringify(params));

      setModalVisible(true);

      const { title, descriptions, component, needEstimated } = actionDispatcher(
        'Inscribe',
        ActionType.Authorize,
      );
      setActionName(title);
      setComponentInfo({ component, params: params });
      setDescriptions(descriptions);
      setNeedEstimated(needEstimated);

      // BuzzBtcNext(params);
    } else {
      // setPostBuzz(false);
      console.log('images ', images[0]);
      // const fileType =
      //   images[0].type ||
      //   getFileType(images[0].fileName || images[0].uri);
      const fileType = getFileType(images[0]);
      console.log('fileType ', fileType);
      const uri = images[0];

      const hex = await getImageAsBase64(uri);

      const attachmentItem: AttachmentItem = {
        data: hex,
        fileType: fileType,
      };

      const buzzOptions: BuzzOptions = {
        content: '周二愉快',
        images: [attachmentItem],
        network: 'mainnet',
      };

      const metaidCon = new MetaIdConsumer();
      const buzz = await metaidCon.createBuzz(buzzOptions);
      console.log('buzz ', buzz);
    }
  }
  async function BuzzBtcNext() {
    if (needEstimated) {
      try {
        const data = metaidComponentRef.current.getEstimatedData();
        const { nextComponent, estimate } = actionDispatcher(actionName, ActionType.Authorize);
        console.log(' 设置参数完成：', data);
        const params = await estimate(data);
        setNeedEstimated(false);
        setComponentInfo({ component: nextComponent, params });
        console.log('estimate 返回：', params);
      } catch (e) {
        console.log('调用报错' + e);
      }
    } else {
      // console.log("进行下一步处理");
      BuzzBtcConfirm();
    }
  }

  async function BuzzBtcConfirm() {
    const { process } = actionDispatcher('Inscribe', 'authorize' as ActionType);
    const data = await process(componentInfo.params, '');
    if (data.commitTxId != '') {
      console.log('process 返回：', JSON.stringify(data));
      setModalVisible(false);
      setShowSuccess(true);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LoadingModal isShow={isShowLoading} />

      <Modal transparent={true} visible={isShowSuccess}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              borderRadius: 10,
              margin: 30,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Success</Text>
            <Image
              style={{
                width: 120,
                height: 113,
                alignSelf: 'center',
                marginTop: 20,
              }}
              source={require('../../../image/buzz_success_icon.png')}
            />

            <Text style={[{ textAlign: 'center', marginTop: 20 }, metaStyles.smallDefaultText]}>
              Please Check This Post In The Following Web3 Application.
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Image
                  style={{ width: 32, height: 32 }}
                  source={require('../../../image/buzz_shownow_icon.png')}
                />
                <Text style={{ color: '#333333', fontSize: 12, marginTop: 3 }}>ShowNow</Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Image
                  style={{ width: 32, height: 32 }}
                  source={require('../../../image/buzz_bitbuzz_icon.png')}
                />
                <Text style={{ color: '#333333', fontSize: 12, marginTop: 3 }}>BitBuzz</Text>
              </View>

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Image
                  style={{ width: 32, height: 32 }}
                  source={require('../../../image/buzz_banana_icon.png')}
                />
                <Text style={{ color: '#333333', fontSize: 12, marginTop: 3 }}>Bigbanana</Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 30,
                justifyContent: 'space-around',
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  setShowSuccess(false);
                  navigate('HomePage');
                }}
              >
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      height: 48,
                      flex: 1,
                      backgroundColor: themeColor,
                      borderRadius: 23,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    },
                  ]}
                >
                  <Text style={{ color: 'white', fontSize: 16 }}>Confirm</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </Modal>

      {/* btc buzz ui */}
      <Modal animationType="slide" visible={modalVisible}>
        <SafeAreaView style={{ flex: 1, margin: Platform.OS === 'ios' ? 30 : 0 }}>
          <View
            style={{
              flex: 1,
              margin: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
              }}
            >
              <MaskedView
                style={{
                  flexDirection: 'row',
                  height: 60,
                }}
                maskElement={
                  <Text
                    style={{
                      fontSize: 20,
                      textAlign: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    AUTHORIZE
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#6CE5F7', '#1F2CFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1 }}
                />
              </MaskedView>
            </View>

            <ScrollView
              style={{
                overflow: 'scroll', // overflow-y-auto（React Native 用 'scroll' 控制垂直滚动）
                borderRadius: 12, // rounded-lg（大圆角，约为 12）
                backgroundColor: '#F9FAFB', // bg-gray-50（Tailwind 的 gray-50 大致为 #F9FAFB）
                width: '100%', // w-full
              }}
            >
              <View
                style={{
                  padding: 16, // p-4 对应 16px
                  gap: 8, // space-y-2 对应 8px 的垂直间距（React Native 使用 gap 需要较新版本）
                  flexDirection: 'column',
                }}
              >
                {componentInfo
                  ? createElement(
                      componentInfo.component,
                      {
                        params: componentInfo.params,
                        ref: needEstimated ? metaidComponentRef : undefined,
                      },
                      <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 16 }}>{actionName}</Text>
                        {descriptions.map((description, index) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: 'row',
                              width: '100%',
                              gap: 2,
                            }}
                          >
                            <CheckBadgeIcon
                              style={{
                                width: 24, // w-6 ≈ 24px
                                height: 24, // h-6 ≈ 24px
                                marginTop: -2, // -mt-0.5 ≈ -2px
                              }}
                            />
                            <Text style={{ flex: 1 }}>{description}</Text>
                          </View>
                        ))}
                      </View>,
                    )
                  : null}
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 24, // pt-6 = 6 * 4
                paddingBottom: 48, // pb-12 = 12 * 4
                width: '100%',
                gap: 8, // gap-2 = 2 * 4
              }}
            >
              <Pressable
                onPress={
                  () => {
                    setModalVisible(false);
                  }
                  // cancelAction
                }
                style={{
                  width: 120,
                  borderRadius: 24, // rounded-3xl ≈ 24
                  backgroundColor: '#D0E8FF', // 替代 'bg-blue-light'，请确认实际颜色
                  paddingVertical: 16, // py-4 = 4 * 4
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14, // text-sm ≈ 14
                    color: '#007AFF', // 请用你实际定义的蓝色
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // setIsShowLoading(true);
                  setModalVisible(true);
                  BuzzBtcNext();
                }}
                style={{
                  width: 120,
                  borderRadius: 24, // rounded-3xl ≈ 24px
                  backgroundColor: '#007AFF', // 替换为你的主色值
                  paddingVertical: 16, // py-4 ≈ 16px
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14, // text-sm ≈ 14px
                    color: '#FFFFFF', // text-white
                  }}
                >
                  {needEstimated ? 'Next' : 'Confirm'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={{ flex: 1 }}>
        <TitleBar />
        <ScrollView>
          <View style={{ paddingHorizontal: 13, flex: 1 }}>
            <TouchableWithoutFeedback
              accessible={false}
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 10,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>New Buzz</Text>
                </View>

                <View style={{}}>
                  <Text style={[metaStyles.smallDefaultText, { marginTop: 30 }]}>
                    Select Networks
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}
                    >
                      {/* <TouchableWithoutFeedback
onPress={()=>{
}}
>
  <View>
  </View>
</TouchableWithoutFeedback> */}
                      <TouchableWithoutFeedback
                        onPress={() => {
                          setBitcoinNet(true);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            source={require('../../../image/logo_btc.png')}
                            style={{ width: 45, height: 45 }}
                          />
                          <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 12 }}>Bitcoin</Text>
                          </View>

                          <View style={{ flex: 1 }} />

                          {isBitcoinNet == true ? (
                            <Image
                              source={require('../../../image/buzz_chain_select_icon.png')}
                              style={{ width: 16, height: 16 }}
                            />
                          ) : (
                            <Image
                              source={require('../../../image/buzz_chain_normal_icon.png')}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    <View
                      style={{
                        backgroundColor: inputNormalBgColor,
                        width: 0.5,
                        height: 20,
                        marginRight: 10,
                        marginLeft: 10,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1.1,
                        alignItems: 'center',
                      }}
                    >
                      <TouchableWithoutFeedback
                        onPress={() => {
                          setBitcoinNet(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image
                            source={require('../../../image/logo_mvc.png')}
                            style={{ width: 45, height: 45 }}
                          />
                          <View style={{ marginLeft: 10, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12 }}>Microvisonchain</Text>
                            {/* <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                sdfewfwsf
              </Text> */}
                            <View style={{ marginLeft: 0 }}>
                              <View
                                style={{
                                  marginTop: 3,
                                  backgroundColor: 'rgba(247, 147, 26, 0.2)',
                                  borderRadius: 10,
                                  alignItems: 'center',
                                  paddingVertical: 2,
                                  paddingHorizontal: 5,
                                }}
                              >
                                <Text style={{ fontSize: 6, color: '#FF981C' }}>
                                  Bitcoin sidechain{' '}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>

                      <View style={{ flex: 1 }} />

                      {isBitcoinNet == true ? (
                        <Image
                          source={require('../../../image/buzz_chain_normal_icon.png')}
                          style={{ width: 16, height: 16 }}
                        />
                      ) : (
                        <Image
                          source={require('../../../image/buzz_chain_select_icon.png')}
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                    </View>
                  </View>
                </View>

                {/* buzz public */}
                <View>
                  <Text style={[metaStyles.smallDefaultText, { marginTop: 10 }]}>Public</Text>
                  <View>
                    <TextInput
                      // placeholder={t("m_import_web_title")}
                      placeholder={'What is happening?'}
                      multiline={true}
                      numberOfLines={6}
                      style={[
                        metaStyles.textInputBorderLine,
                        {
                          paddingVertical: 20,
                          height: 135,
                          textAlignVertical: 'top',
                        },
                      ]}
                      onChangeText={(text) => {
                        // setMneMonic(text.trim());
                        // setMneMonic(text);
                      }}
                    />
                  </View>

                  <TouchableWithoutFeedback
                    onPress={() => {
                      console.log('pickImage');
                      pickImage();
                    }}
                  >
                    <Image
                      source={require('../../../image/buzz_picture_icon.png')}
                      style={{ width: 20, height: 20, marginTop: 10 }}
                    />
                  </TouchableWithoutFeedback>

                  {/* {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: 200, height: 200, marginTop: 10 }}
                  />
                )} */}

                  {/* <ScrollView style={styles.imageContainer}> */}
                  <View style={styles.imageGrid}>
                    {images.map((uri, index) => (
                      <View key={index} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.image} />
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteImage(index)}
                        >
                          <Image
                            source={require('../../../image/buzz_delete_icon.png')} // 删除图标的路径
                            style={styles.deleteIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  {/* </ScrollView> */}

                  {/* <ScrollView contentContainerStyle={styles.scrollViewContent}>
                  <FlatList
                    data={images}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={3}
                    scrollEnabled={false} // 禁用 FlatList 自身的滚动，由外部的 ScrollView 控制滚动
                  />
                </ScrollView> */}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 30,
                    justifyContent: 'space-around',
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={async () => {
                      handleBuzzSubmit();
                    }}
                  >
                    <View
                      style={[
                        {
                          flexDirection: 'row',
                          height: 48,
                          flex: 1,
                          backgroundColor: themeColor,
                          borderRadius: 23,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 20,
                        },
                      ]}
                    >
                      <Text style={{ color: 'white', fontSize: 16 }}>OK</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>

                {/* </ScrollView> */}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
