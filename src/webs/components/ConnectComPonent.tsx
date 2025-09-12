import { useState } from "react";
import PsbtDetail from "../commons/PsbtDetail";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CheckBadgeIcon from "@/components/icons/CheckBadgeIcon";
import { metaStyles } from "@/constant/Constants";
import { TouchableWithoutFeedback } from "react-native";
import { AsyncStorageUtil } from "@/utils/AsyncStorageUtil";
import { AutoPaymentAdd } from "../actions/auto-payment";

export default ({ children, params: { psbtHex } }) => {
  const [visible, setVisible] = useState(false);
  const [isNeedAdd, setIsNeedAdd] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 17, }}>Connect </Text>
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
          }}
        >
          <CheckBadgeIcon style={{ width: 24, height: 24 }} />

          <Text>View your wallet address,balance and activity</Text>
        </View>

        <View
          style={{
            marginTop: 5,
            flexDirection: "row",
          }}
        >
          <CheckBadgeIcon style={{ width: 24, height: 24 }} />

          <Text>Request approval for transactions</Text>
        </View>

    

        
      </View>
    </SafeAreaView>
  );
};
