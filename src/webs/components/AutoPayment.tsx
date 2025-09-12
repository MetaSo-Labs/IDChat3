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
          marginRight: 3,
        }}
      >
        <Text> Requesting Approval for Auto-Payment </Text>
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
          }}
        >
          <CheckBadgeIcon style={{ width: 24, height: 24 }} />

          <Text>
            Transactions for on-chain data with gas fees below 10000 sats;
          </Text>
        </View>

        <View
          style={{
            marginTop: 5,
            flexDirection: "row",
          }}
        >
          <CheckBadgeIcon style={{ width: 24, height: 24 }} />

          <Text>Only for MicrovisionChain</Text>
        </View>

        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ alignContent: "center", textAlign: "center" }}>
            (You can disable this approval inthe wallet's settings menu.)
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
