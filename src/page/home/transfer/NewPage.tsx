import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TitleBar } from "@/constant/Widget";

export default function NewPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View>
            
        </View>
      </View>
    </SafeAreaView>
  );
}
