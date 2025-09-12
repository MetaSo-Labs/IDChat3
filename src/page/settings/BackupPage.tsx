import {
  View,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BaseView, Line, RoundSimButton, TitleBar, ToastView } from "@/constant/Widget";
import { SafeAreaView } from "react-native-safe-area-context";
import { WalletBean } from "@/bean/WalletBean";
import { getCurrentAccountID, getWalletBeans } from "@/utils/WalletUtils";
import { navigate } from "@/base/NavigationService";
import { metaStyles, themeColor } from "@/constant/Constants";
import { AsyncStorageUtil, wallets_key } from "@/utils/AsyncStorageUtil";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";


export default function BackupPage() {
  let [walletList, setWalletList] = useState<WalletBean[]>([]);
  const [isShowBackUp, setIsShowBackUp] = useState(false);
  const [walletBackUp, setWalletBackUp] = useState("");
  const [mvcPath, setMvcPath] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    getWalletData();
  }, []);

  async function getWalletData() {
    const currentAccountID = await getCurrentAccountID();
    const wallets = await getWalletBeans();
    // setWalletList(wallets);
    const filterWallets = wallets.filter((item) => item.mnemonic != "1");
    setWalletList(filterWallets);
  }

  const ListItem = ({ index, item }) => {
    return (
      <TouchableWithoutFeedback
        onPress={async () => {
          setWalletBackUp(item.mnemonic);
          setMvcPath(item.mvcTypes.toString());
          setIsShowBackUp(true);
          const wallets = await getWalletBeans();
          const wallet = wallets.find((itemWallet) => {
            console.log(itemWallet.mnemonic);
            if (itemWallet.mnemonic == item.mnemonic) {
              return itemWallet;
            }
          });
          wallet.isBackUp = true;
          await AsyncStorageUtil.updateItem(wallets_key, wallets);
          getWalletData();
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginTop: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ marginLeft: 10, color: "#303133", fontSize: 16 }}>
            {item.name}
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
          <Image
            source={require("../../../image/list_icon_ins.png")}
            style={{ width: 20, height: 20, marginTop: 5 }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal transparent={true} visible={isShowBackUp}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingTop: 30,
              marginHorizontal: 20,
              paddingBottom: 15,
            }}
          >
            <Text style={[metaStyles.defaultText18, { textAlign: "center" }]}>
              {t("s_backup_wallet_title")}
            </Text>

            <Line />

            <Text style={[metaStyles.grayTextdefault66, { marginTop: 20 }]}>
              Mnemonic Phrase
            </Text>
            <Text style={[metaStyles.defaultText, { marginTop: 20 }]}>
              {walletBackUp}
            </Text>

            <TouchableWithoutFeedback onPress={()=>{
              setIsShowBackUp(false)
               Clipboard.setString(walletBackUp);
               ToastView({ text: "Copy Successful" });
            }}>
               <View style={{ flexDirection: "row" ,alignItems:'center',marginTop: 20 }}>
              <Text style={[metaStyles.grayTextdefault66,]}>
                Copy Mnemonic
              </Text>

              <Image
                source={require("../../../image/meta_copy_icon.png")}
                style={{ width: 15, height: 15, marginLeft: 5 }}
              />
            </View>

            </TouchableWithoutFeedback>

           

            <Text style={[metaStyles.grayTextdefault66, { marginTop: 20 }]}>
              MVC Derivation Path
            </Text>
            <Text
              style={[
                metaStyles.defaultText,
                { marginTop: 10, marginBottom: 30 },
              ]}
            >
              m/44'/{mvcPath}'/0'/0/0
            </Text>

            {/* <RoundSimButton textColor="#fff" title={"OK"} event={()=>{
            setIsShowBackUp(false)
           }}/> */}

            <TouchableWithoutFeedback
              onPress={async () => {
                setIsShowBackUp(false);
              }}
            >
              <Text
                style={[
                  metaStyles.largeDefaultLittleText,
                  { textAlign: "center", color: themeColor },
                ]}
              >
                {t("s_ok")}
              </Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>

      <View style={{ flex: 1 }}>
        <TitleBar title={t("s_backup_wallet")} />
        <View style={{ padding: 20 }}>
          <FlatList
            // style={{ marginTop: 20 }}
            keyExtractor={(item, index) => index.toString()}
            data={walletList}
            renderItem={ListItem}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
