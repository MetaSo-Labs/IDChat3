import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  Modal,
  ScrollView,
  Linking,
  ImageBackground,
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

export default function BtcNftMRC721DetailPage({ route }) {
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
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  height: 150,
                  width: 150,
                  marginTop: 10,
                  marginRight: 10,
                  // paddingHorizontal: 10,
                  // paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderColor: inputNormalBgColor,
                  borderWidth: 1,
                }}
              >
                <ImageBackground
                  source={{ uri: nftDetail.showImage }} // 替换为你的图片路径
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <View style={{ flex: 1 }}></View>

                  <View style={{ flexDirection: "row", marginBottom: 2 }}>
                    <View style={{ flex: 1 }} />
                    <View
                      style={{
                        justifyContent: "center",
                        flexDirection: "row",
                        width: 50,
                        backgroundColor: "#767EFF",
                        marginTop: 3,
                        // backgroundColor: 'rgba(23, 26, 255, 0.1)',
                        borderRadius: 5,
                        marginRight: 5,
                        marginBottom: 5,
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
                        546 sat{" "}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            </View>

            <Text
              style={[
                metaStyles.largeDefaultLittleText,
                { textAlign: "center" },
              ]}
            >
              #{nftDetail.itemPinNumber}
            </Text>

            <Text
              style={[
                metaStyles.largeDefaultLittleText,
                { textAlign: "center" },
              ]}
            >
              {nftDetail.name}
            </Text>

            {walletMode != wallet_mode_observer && (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    // navigate("BtcNftTransferPage",{type:"brc20",nftDetail:nftDetail})

                    // if (nftDetail.status == 0) {
                      navigate("PinNftTransferPage", {
                        type: "pin",
                        nftDetail: nftDetail,
                      });
                    // }
                  }}
                >
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
                      {/* {nftDetail.status == 0 ? "Transfer" : "Pending"} */}
                      Transfer
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            )}

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
                  {nftDetail.itemPinId}
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
                  {nftDetail.outValue}
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

                <TouchableWithoutFeedback
                  onPress={() => {
                    // openLink(nftDetail.preview);
                    openLink(nftDetail.showImage);
                  }}
                >
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
                    {nftDetail.showImage}
                  </Text>
                </TouchableWithoutFeedback>
              </View>

              {/* <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>Content</Text>
                <View style={{ flex: 1 }} />

                <TouchableWithoutFeedback
                  onPress={() => {
                    openLink(nftDetail.content);
                  }}
                >
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
              </View> */}

              {/* <View
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
              </View> */}

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#666", fontSize: 16 }}>ContentType</Text>
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

              {/* <View
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
              </View> */}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
