import {
  View,
  Text,
  TextInput,
  Image,
  Modal,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useCallback, useState } from "react";
import {
  RoundSimButton,
  TitleBar,
  useEasyToast,
} from "../../constant/Widget";
import { SafeAreaView } from "react-native-safe-area-context";
import { metaStyles, semiTransparentGray } from "../../constant/Constants";
import EasyToast from "react-native-easy-toast";
import { ActivityIndicator } from "react-native-paper";

import { LinearGradient } from "expo-linear-gradient";
import {
  
  CurrentAccountIDKey,
  CurrentWalletIDKey,
  wallets_key,
  walllet_address_type_key,
  createStorage,
} from "../../utils/AsyncStorageUtil";

import { useData } from "../../hooks/MyProvider";

const storage = createStorage();

export default function ImportWalletFirstPage(props) {
  const toastRef = useEasyToast("center");
  const [mnemonic, setMneMonic] = useState("");


  return (
    <TouchableWithoutFeedback onPress={()=>{
      console.log("click");
      Keyboard.dismiss()
     }}>
       <SafeAreaView style={{ flex: 1 }}>
      <EasyToast ref={toastRef} position="center" />
      <TitleBar />

      <View style={[metaStyles.verMarginContainer, { marginBottom: 50 }]}>
      

        <Text style={[metaStyles.largeDefaultText, { fontWeight: "bold" }]}>
          Enter your mnemonic phrase
        </Text>
        <Text style={[metaStyles.smallDefaultText, { marginTop: 20 }]}>
          Separate mnemonic words with spaces. Supports the import of 12-digit,
          18-digit, and 24-digit mnemonic phrases from any wallet.
        </Text>
        <Text style={[metaStyles.defaultText, { marginTop: 30 }]}>
          Please Enter
        </Text>

        <View>
          <TextInput
            placeholder="Enter your mnemonic phrase"
            multiline={true}
            numberOfLines={6}
            style={[
              metaStyles.textInputDefault,
              { paddingVertical: 20, height: 135, textAlignVertical: "top" },
            ]}
            onChangeText={(text) => {
              setMneMonic(text);
            }}
          />
        </View>

     

        <View style={metaStyles.noticeRed}>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={require("../../../image/meta_waring_icon.png")}
              style={{ width: 20, height: 20 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: "#FA5151",
                fontWeight: "bold",
                marginLeft: 5,
              }}
            >
              Warning!{" "}
            </Text>
          </View>
          <Text style={{ color: "#FA5151", marginTop: 5 }}>
            Metalet will not record your mnemonic words and private keys. Users
            manage their own permissions and your assets are under your control.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* <GradientAvatar/> */}
        <RoundSimButton
          title="Confirm"
          textColor="white"
          event={() => {
         
          }}
        />
      </View>
    </SafeAreaView>
      </TouchableWithoutFeedback>
   
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalView: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    // elevation: 5,
  },
});
