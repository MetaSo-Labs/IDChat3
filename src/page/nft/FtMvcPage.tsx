import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { metaStyles } from "../../constant/Constants";
import { CustomTabBar, NoMoreDataView } from "../../constant/Widget";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BtcFtPage from "../BtcFtPage";
import MvcFtPage from "../MvcFtpage";
import { Title } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useData } from "../../hooks/MyProvider";
import {
  network_all,
  network_btc,
  network_mvc,
} from "../../utils/AsyncStorageUtil";

const TabsTop = createMaterialTopTabNavigator();

export default function FtMvcPage() {
  return (
    <View style={[metaStyles.varContainer, { backgroundColor: "#fff" }]}>
      <TabsTopNavigator />
    </View>
  );
}

function TabsTopNavigator() {
  return (
    <TabsTop.Navigator
      tabBar={(props) => (
        <CustomTabBar {...props} isShowIndicator={false} isSmallTitle={true} />
      )}
      style={{ flex: 1, marginTop: 10 }}
    >
  
      <TabsTop.Screen
        name="MvcFtPage"
        options={{ title: "MVC" }}
        component={MvcFtPage}
      />
    </TabsTop.Navigator>
  );
}
