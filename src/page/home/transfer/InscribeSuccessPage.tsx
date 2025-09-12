import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoundSimButton, TitleBar } from "@/constant/Widget";
import {
  litterWhittleBgColor,
  metaStyles,
  themeColor,
} from "@/constant/Constants";
import { navigate } from "@/base/NavigationService";

export default function InscribeSuccessPage({route}) {


const {fileName}=route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                paddingTop: 10,
                marginBottom: 20,
                alignItems: "center",
                borderRadius: 10,
                padding: 20,
                borderWidth: 1,
                borderColor: "#E5E5E5",
                width: 200,
              }}
            >
              {/* <Text style={[metaStyles.grayTextSmall66, { marginTop: 20 }]}>
              {item.ticker.toUpperCase()}
            </Text> */}

              <Text
                style={[metaStyles.largeDefaultLittleText, { marginTop: 15 }]}
              >
                {fileName}
              </Text>

              <View
                style={{
                  backgroundColor: "rgba(255, 143, 31, 0.3)",
                  borderRadius: 30,
                  alignItems: "center",
                  paddingVertical: 8,
                  marginTop: 25,
                  paddingHorizontal: 20,
                }}
              >
                <Text style={{ color: "rgba(255, 143, 31, 1)" }}>
                  Confirmed
                </Text>
              </View>
            </View>
          </View>

          <Text style={[metaStyles.largeDefaultText]}>
            Inscribe Successfully
          </Text>

          <Text style={[metaStyles.grayTextSmall66, { marginTop: 10 }]}>
            The transferable and available balance of BRC20 will be refreshed in
            a few minutes.
          </Text>

        <View style={{position:'absolute',bottom:20,left:20,right:20}}>
            <RoundSimButton title={"Done"} textColor="#fff" event={()=>{
                navigate('HomePage')
            }}/>

        </View>

        </View>
      </View>
    </SafeAreaView>
  );
}
