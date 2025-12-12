import { View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TitleBar } from '@/constant/Widget';
import WebView from 'react-native-webview';
import { navigate } from '@/base/NavigationService';

export default function ToolkitPage(props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View style={{ flex: 1, margin: 20 }}>
          <Text style={{ fontSize: 18 }}>MVC (Bitcoin side chain)</Text>

          <TouchableWithoutFeedback
            onPress={() => {
              navigate('MergeSpacePage');
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* <Image
                  source={require("../../image/settings_about_icon.png")}
                  style={{ width: 45, height: 45 }}
                /> */}
              <Text style={{ color: '#303133', fontSize: 16 }}>Space Merge</Text>
              <View style={{ flex: 1 }} />

              <Image
                source={require('@image/list_icon_ins.png')}
                style={{ width: 20, height: 20, marginLeft: 5 }}
              />
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={() => {
              navigate('MergeFtPage');
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* <Image
                  source={require("../../image/settings_about_icon.png")}
                  style={{ width: 45, height: 45 }}
                /> */}
              <Text style={{ color: '#303133', fontSize: 16 }}>FT Merge</Text>
              <View style={{ flex: 1 }} />

              <Image
                source={require('@image/list_icon_ins.png')}
                style={{ width: 20, height: 20, marginLeft: 5 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
}
