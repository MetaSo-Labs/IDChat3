import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RoundSimButton, TitleBar } from "@/constant/Widget";
import { FeedBean } from "@/types/btcfeed";
import {
  inputNormalBgColor,
  metaStyles,
  themeColor,
} from "@/constant/Constants";
import { formatTime } from "@/utils/MetaFunUiils";
import { navigate } from "@/base/NavigationService";
import { useData } from "@/hooks/MyProvider";
import { wallet_mode_observer } from "@/utils/AsyncStorageUtil";

export default function BtcNftDetailPage({ route }) {
  const { nftDetail } = route.params;
  const { walletMode, updateWalletMode } = useData();

  const openLink = (link) => {
    Linking.openURL(link);
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <TitleBar />
        <ScrollView>
          <View style={{ flex: 1, marginTop: 20 }}>
            {/* head */}
            <View style={{ padding: 15, alignItems: "center", marginTop: 20 }}>
              <View
                style={{
                  backgroundColor: "#171AFF",
                  borderRadius: 8,
                  height: 150,
                  width: 150,
                  marginTop: 10,
                  marginRight: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <Text style={{color:'#fff',fontSize:10}}>{JSON.stringify(item.nftShowContent)}</Text> */}
                <Text style={{ color: "#fff", fontSize: 13, marginBottom: 20 }}>
                  {nftDetail.contentBody}
                </Text>

                <View
                  style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    width: 50,
                    backgroundColor: "#767EFF",
                    borderRadius: 5,
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      paddingHorizontal: 2,
                      paddingVertical: 2,
                    }}
                  >
                    {" "}
                    546 sat{" "}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={[
                metaStyles.largeDefaultLittleText,
                { textAlign: "center" },
              ]}
            >
              #{nftDetail.inscriptionNumber}
            </Text>

            {walletMode != wallet_mode_observer && (  <View style={{ alignItems: "center", marginTop: 20 }}>
             <TouchableWithoutFeedback onPress={()=>{
                navigate("BtcNftTransferPage",{type:"brc20",nftDetail:nftDetail})
             }}>
             <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#F3F3FF",
                  borderRadius: 30,
                  paddingVertical: 13,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: themeColor,
                    textAlign: "center",
                    marginLeft: 10,
                    fontSize: 16,
                  }}
                >
                  Transfer
                </Text>
              </View>
             </TouchableWithoutFeedback>
            </View>)}
          

            {/* transfer end */}

            <View
              style={{
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 15,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>Network</Text>
                <View style={{ flex: 1 }} />
                <Image
                  source={require("../../../image/logo_btc.png")}
                  style={{ width: 18, height: 18 }}
                />
                <Text style={{ color: "#999", fontSize: 14, marginLeft: 5 }}>
                  BitCoin
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>ID</Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                  }}
                >
                  {nftDetail.inscriptionId}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>Address</Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                  }}
                >
                  {nftDetail.address}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                  Output value
                </Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                    textAlign: "right",
                  }}
                >
                  {nftDetail.outputValue}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>Preview</Text>
                <View style={{ flex: 1 }} />

                <TouchableWithoutFeedback onPress={() => {
                    openLink(nftDetail.preview)
                }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={{
                      // color: "#999",
                      fontSize: 16,
                      marginLeft: 5,
                      width: "50%",
                      textAlign: "right",
                      color: themeColor,
                      textDecorationLine: "underline",
                    }}
                  >
                    {nftDetail.preview}
                  </Text>
                </TouchableWithoutFeedback>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>Content</Text>
                <View style={{ flex: 1 }} />

                <TouchableWithoutFeedback onPress={() => {
                    openLink(nftDetail.content)
                }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={{
                      // color: "#999",
                      fontSize: 16,
                      marginLeft: 5,
                      width: "50%",
                      textAlign: "right",
                      color: themeColor,
                      textDecorationLine: "underline",
                    }}
                  >
                    {nftDetail.content}
                  </Text>
                </TouchableWithoutFeedback>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                 Content Length
                </Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                    textAlign: "right",
                  }}
                >
                  {nftDetail.contentLength}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                ContentType
                </Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                    textAlign: "right",
                  }}
                >
                  {nftDetail.contentType}
                </Text>
              </View>

              {/* <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                Timestamp
                </Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                    textAlign: "right",
                  }}
                >
                   {formatTime(parseFloat(nftDetail.timestamp))}
                </Text>
              </View> */}

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>
                Genesis Transaction
                </Text>
                <View style={{ flex: 1 }} />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: "#999",
                    fontSize: 16,
                    marginLeft: 5,
                    width: "50%",
                    textAlign: "right",
                  }}
                >
                  {nftDetail.genesisTransaction}
                </Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
