import { View, Text,Image } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import  HomePage from "./HomePage";
import  SettingsPage from "./SettingsPage";
import { metaStyles } from "../constant/Constants";


const Tab = createBottomTabNavigator();

export default function Index() {
  return <NavigationContainer>
    <Tab.Navigator
    screenOptions={({route})=>({
      tabBarShowLabel:false,
      headerShown:false,
      tabBarIcon:({focused,color,size})=>{
        let icon;
            if (route.name === "Home") {
              icon = focused ? (
                <Image
                  source={require("../../image/me_index_select_tab.png")}
                  style={metaStyles.tabImage}
                />
              ) : (
                <Image
                  source={require("../../image/me_index_normal_tab.png")}
                  style={metaStyles.tabImage}
                />
              );
            } else {
              icon = focused ? (
                <Image
                  source={require("../../image/me_settings_select_tab.png")}
                  style={metaStyles.tabImage}
                />
              ) : (
                <Image
                  source={require("../../image/me_settings_normal_tab.png")}
                  style={metaStyles.tabImage}
                />
              );
            }
            return icon;
      }
    })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Settings" component={SettingsPage} />
    </Tab.Navigator>
  </NavigationContainer>;
}
