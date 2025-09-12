import React from "react";
import * as Clipboard from "expo-clipboard";
import CopyIcon from "@/components/icons/CopyIcon";
import { Text, TouchableOpacity, View } from "react-native";

export default ({
  children,
  params: { feeRate, commitTx, revealTxs, totalCost, commitCost, revealCost },
}) => {
  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
  };
  return (
    <View style={{ marginBottom: 8 }}>
      {children ? children : null}
      <View
        style={{        
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#9CA3AF" }}>Commit Cost</Text>
        <Text>{commitCost / 1e8} BTC</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#9CA3AF" }}>Reveal Cost</Text>
        <Text>{revealCost / 1e8} BTC</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: "#9CA3AF",
          }}
        >
          Total Cost
        </Text>
        <Text>{totalCost / 1e8} BTC</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#9CA3AF" }}>Fee Rate</Text>
        <Text>{feeRate} sat/vB</Text>
      </View>
      
    </View>
  );
};
