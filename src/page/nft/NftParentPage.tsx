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
import BtcNftPage from "../BtcNftPage";
import MvcNftPage from "../MvcNftPage";
import { useData } from "../../hooks/MyProvider";
import {
  network_all,
  network_btc,
  network_mvc,
} from "../../utils/AsyncStorageUtil";
import BtcMRC721Page from "../BtcMRC721Page";
import BtcMRC721RePage from "../BtcMRC721RePage";

const TabsTop = createMaterialTopTabNavigator();

export default function NftParentPage() {
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
        name="BtcNftPage"
        // options={{ title: "Bitcoin" }}
        options={{ title: "Ordinals" }}
        component={BtcNftPage}
      />

      <TabsTop.Screen
        // name="BtcMRC721Page"
        name="BtcMRC721RePage"
        options={{ title: "MRC721" }}
        // component={BtcMRC721Page}
        component={BtcMRC721RePage}
      />

      <TabsTop.Screen
        name="MvcNftPage"
        // options={{ title: "MVC" }}
        options={{ title: "MetaContract" }}
        component={MvcNftPage}
      />
    </TabsTop.Navigator>
  );
}
