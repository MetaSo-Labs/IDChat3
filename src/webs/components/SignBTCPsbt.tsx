import { useState } from "react";
import PsbtDetail from "../commons/PsbtDetail";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default ({ children, params: { psbtHex } }) => {
  const [visible, setVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{
        marginBottom: 8
      }}>
        {children ? children : null}
       
      </View>
    </SafeAreaView>
  );
};
