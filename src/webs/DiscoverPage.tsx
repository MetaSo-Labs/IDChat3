import { navigate } from "@/base/NavigationService";
import SearchIcon from "@/components/icons/SearchIcon";
import useNetworkStore from "@/stores/useNetworkStore";
import { METALET_WALLET_PREFIX } from "@/queries/hosts";
import { useDiscoverDataQuery } from "@/queries/discover";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Modal,
  Keyboard,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  inputNormalBgColor,
  litterWhittleBgColor,
  metaStyles,
  normalColor,
  themeColor,
} from "@/constant/Constants";
import { RoundSimButton, ToastView } from "@/constant/Widget";
import { useState } from "react";
import { t, use } from "i18next";

export default function DiscoverPage() {
  const { width } = Dimensions.get("window");

  const { network } = useNetworkStore();
  const { isLoading, data: discoverData } = useDiscoverDataQuery(network, {
    enabled: !!network,
  });

  const [showMen, setShowMen] = useState(false);

  const [isIndexInscribe, setIndexInscribe] = useState(false);
  const [isOtherInscribe1, setOtherInscribe1] = useState(false);
  const [isOtherInscribe2, setOtherInscribe2] = useState(false);
  const [isOtherInscribe3, setOtherInscribe3] = useState(false);
  const [isPostBuzz, setPostBuzz] = useState(false);
  const [isDeploy, setDeploy] = useState(true);

  // console.log("discoverData", discoverData);

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      height: 40,
      paddingHorizontal: 18,
      backgroundColor: "#F5F7F9",
      borderRadius: 60,
      display: "none", // 如果你是用来控制可见性，推荐用 conditional rendering，而不是 display: 'none'
    },
    text: {
      color: "#BFC2CC",
      lineHeight: 40,
    },
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowMen(false);
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            flex: 1,
            marginTop: 20,
            marginHorizontal: 20,
            marginBottom: 20,
            backgroundColor: "#fff",
          }}
        >
          <Text style={[{ textAlign: "left" }, metaStyles.titleText]}>
            DApp
          </Text>
          <View style={styles.container}>
            <SearchIcon color="#BFC2CC" />
            <Text style={styles.text}>app.orders.exchange</Text>
          </View>

          {isLoading ? (
            <Text
              style={{
                width: "100%",
                paddingVertical: 48, // py-12 = 12 * 4 = 48
                alignItems: "center",
              }}
            >
              Loading...
            </Text>
          ) : null}

          {discoverData && discoverData.recommend ? (
            <View style={{ marginTop: 20, width: "100%" }}>
              <Text style={{ fontWeight: "bold" }}>Recommended</Text>
              <ScrollView
                horizontal={true}
                style={{ marginVertical: 20 }}
                scrollEnabled={false}
              >
                {discoverData.recommend.length === -1
                  ? discoverData.recommend.map((recommend) => (
                      <View style={{ flex: 1 }} key={recommend.url}>
                        <Image
                          style={{
                            width: "100%",
                            aspectRatio: 1,
                            borderRadius: 16,
                          }}
                          source={{
                            uri: `${METALET_WALLET_PREFIX}${recommend.recover}`,
                          }}
                        />
                        <View
                          style={{
                            backgroundColor: recommend.themeColor,
                            height: 50,
                            width: "100%",
                            position: "absolute",
                            bottom: 0,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingHorizontal: 8, // px-2 ≈ 8px
                            borderBottomLeftRadius: 16, // 2xl ≈ 16px
                            borderBottomRightRadius: 16,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{ color: "white", fontWeight: "bold" }}
                            >
                              {recommend.name}
                            </Text>
                            <Text style={{ color: "white", fontSize: 12 }}>
                              {recommend.desc}
                            </Text>
                          </View>
                          <Image
                            source={{
                              uri: `${METALET_WALLET_PREFIX}${recommend.icon}`,
                            }}
                          />
                        </View>
                      </View>
                    ))
                  : discoverData.recommend.map((recommend) => (
                      <TouchableOpacity
                        style={{
                          marginLeft:
                            recommend.name == "Orders.Exchange" ? 0 : 20,
                        }}
                        key={recommend.url}
                        onPress={() => {
                          console.log("url", recommend.url);

                          navigate("WebsPage", {
                            url: recommend.url,
                          });
                        }}
                      >
                        <Image
                          style={{
                            width: width / 2 - 30,
                            height: width / 2 - 30,
                            borderRadius: 20,
                          }}
                          source={{
                            uri: `${METALET_WALLET_PREFIX}${recommend.recover}`,
                          }}
                        />
                        <View
                          style={[
                            { backgroundColor: recommend.themeColor },
                            {
                              height: 48, // h-12 = 12 * 4 = 48px
                              width: "100%",
                              position: "absolute",
                              bottom: 0,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingHorizontal: 8, // px-2 = 2 * 4 = 8px
                              borderBottomLeftRadius: 16, // rounded-b-2xl = 2xl ≈ 16px
                              borderBottomRightRadius: 16,
                            },
                          ]}
                        >
                          <View
                            style={{
                              flex: 1,
                              paddingRight: 8, // pr-2 = 2 * 4 = 8
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                color: "#FFFFFF", // text-white
                                fontSize: 12, // text-xs ≈ 12px
                                fontWeight: "bold", // font-bold
                              }}
                            >
                              {recommend.name}
                            </Text>
                            <Text
                              style={{
                                color: "rgba(255, 255, 255, 0.8)", // text-white/80 表示白色 80% 不透明度
                                fontSize: 12, // text-xs ≈ 12px
                              }}
                            >
                              {recommend.desc}
                            </Text>
                          </View>
                          <Image
                            style={{
                              width: 48, // w-12 → 12 * 4 = 48
                              height: 48, // h-12 → 48
                              borderRadius: 12, // rounded-xl ≈ 12
                              marginTop: -24, // -mt-6 → -6 * 4 = -24
                            }}
                            source={{
                              uri: `${METALET_WALLET_PREFIX}${recommend.icon}`,
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
              </ScrollView>
            </View>
          ) : null}

          {discoverData && discoverData.tops ? (
            <View
              style={{
                flex: 1, // flex-1
                width: "100%", // w-full
                marginBottom: 8, // space-y-2 → 2 * 4 = 8 (vertical spacing between child elements)
              }}
            >
              <Text style={{ fontWeight: "bold" }}>TOP</Text>
              <ScrollView
                style={{
                  flexDirection: "column", // flex-col
                  gap: 16, // gap-y-4 → 4 * 4 = 16 (vertical spacing between child elements)
                  width: "100%", // w-full
                }}
              >
                {discoverData.tops.map((top) => (
                  <TouchableOpacity
                    key={top.url}
                    style={{
                      flexDirection: "row", // flex-row
                      alignItems: "center", // items-center
                      gap: 8, // gap-x-2 → 2 * 4 = 8 (horizontal spacing between child elements)
                      width: "100%", // w-full
                      marginTop:20
                    }}
                    onPress={() => {
                      navigate("WebsPage", {
                        url: top.url,
                        icon: `${METALET_WALLET_PREFIX}${top.icon}`,
                      });
                    }}
                  >
                    <Image
                      style={{
                        width: 48, // w-12 → 12 * 4 = 48 (单位：像素)
                        height: 48, // h-12 → 12 * 4 = 48 (单位：像素)
                        borderRadius: 16, // rounded-2xl → 2 * 8 = 16 (单位：像素)
                      }}
                      source={{
                        uri: `${METALET_WALLET_PREFIX}${top.icon}`,
                      }}
                    />
                    <View
                      style={{
                        flex: 1, // flex-1：使视图填满父容器的剩余空间
                        flexDirection: "column", // flex-col：设置为垂直排列
                        gap: 4, // gap-y-1：在垂直方向上设置间距（1单位通常等于4px，所以下面设置为4px）
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14, // text-sm：小号字体，一般是14px
                          fontWeight: "500", // font-medium：中等权重的字体
                        }}
                      >
                        {top.name}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={{
                          color: "#666666", // text-[#666666]：指定文字颜色为 #666666
                          fontSize: 12, // text-xs：小号字体，通常是12px
                          width: "100%", // w-full：宽度占满父容器
                        }}
                      >
                        {top.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* <Image
        source={require("../../image/home_add_icon.png")}
        style={{ width: 20, height: 20 }}
      /> */}
            </View>
          ) : null}
        </View>

        {/* add menu-------------------- */}
        {/* <TouchableWithoutFeedback
          onPress={() => {
            setShowMen(!showMen);
          }}
        >
          <Image
            source={require("../../image/home_add_icon.png")}
            style={{
              width: 38,
              height: 38,
              position: "absolute",
              bottom: 180,
              right: 0,
              marginRight: 20,
            }}
          />
        </TouchableWithoutFeedback> */}

        <View
          style={{
            position: "absolute",
            bottom: 100,
            right: 0,
            marginRight: 20,
            backgroundColor: "#fff",
            padding: 13,
            borderRadius: 10,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            display: showMen ? "flex" : "none",
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setShowMen(false);
              // setPostBuzz(true);
              navigate("ShowBuzzPage");
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../image/web_buzz_icon.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={[{ fontSize: 12, color: normalColor }]}>Buzz</Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={() => {
              setIndexInscribe(true);
              setShowMen(false);
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Image
                source={require("../../image/web_inscribe_icon.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={{ color: themeColor, fontSize: 12 }}>Inscribe</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/*  modal 首页钱包-------------------- */}
        <Modal transparent={true} visible={isIndexInscribe}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    Inscribe
                  </Text>
                  <View style={{ flex: 1 }} />

                  <TouchableWithoutFeedback
                    onPress={() => {
                      setIndexInscribe(false);
                    }}
                  >
                    <Image
                      source={require("../../image/metalet_close_big_icon.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableWithoutFeedback>
                </View>

                <View
                  style={{
                    marginTop: 40,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setDeploy(!isDeploy);
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: isDeploy ? themeColor : "#F3F3FF",
                        borderRadius: 30,
                        paddingVertical: 13,
                        paddingHorizontal: 30,
                        alignItems: "center",
                        marginLeft: 20,
                        width: "33%",
                      }}
                    >
                      <Text
                        style={{
                          color: isDeploy ? "#fff" : themeColor,
                          textAlign: "center",
                          marginLeft: 10,
                          lineHeight: 20,
                          fontSize: 18,
                        }}
                      >
                        Deploy
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      setDeploy(!isDeploy);
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: isDeploy ? "#F3F3FF" : themeColor,
                        borderRadius: 30,
                        paddingVertical: 13,
                        paddingHorizontal: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "33%",
                      }}
                    >
                      <Text
                        style={{
                          color: isDeploy ? themeColor : "#fff",
                          textAlign: "center",
                          marginLeft: 10,
                          lineHeight: 20,
                          fontSize: 18,
                        }}
                      >
                        Mint
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>

                {isDeploy && (
                  <View>
                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "red" }}>*</Text>
                      <Text style={[metaStyles.smallDefaultText]}>
                        MRC20 Name
                      </Text>
                    </View>

                    <TextInput
                      style={{
                        backgroundColor: litterWhittleBgColor,
                        padding: 10,
                        borderRadius: 23,
                        overflow: "hidden",
                        height: 50,
                        marginTop: 10,
                      }}
                      numberOfLines={1}
                      // value={uriReady}
                      // onFocus={() => {
                      // setFeedModeType(feedModeCustom);
                      // setIsFocusEdit(true);
                      // }}
                      // onChangeText={(text) => {}}
                    />

                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "red" }}>*</Text>
                      <Text style={[metaStyles.smallDefaultText]}>
                        Mint Limit
                      </Text>
                    </View>

                    <TextInput
                      style={{
                        backgroundColor: litterWhittleBgColor,
                        padding: 10,
                        borderRadius: 23,
                        overflow: "hidden",
                        height: 50,
                        marginTop: 10,
                      }}
                      numberOfLines={1}
                      // value={uriReady}
                      // onFocus={() => {
                      // setFeedModeType(feedModeCustom);
                      // setIsFocusEdit(true);
                      // }}
                      // onChangeText={(text) => {}}
                    />

                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "red" }}>*</Text>
                      <Text style={[metaStyles.smallDefaultText]}>
                        Amount Per Mint
                      </Text>
                    </View>

                    <TextInput
                      style={{
                        backgroundColor: litterWhittleBgColor,
                        padding: 10,
                        borderRadius: 23,
                        overflow: "hidden",
                        height: 50,
                        marginTop: 10,
                      }}
                      numberOfLines={1}
                      // value={uriReady}
                      // onFocus={() => {
                      // setFeedModeType(feedModeCustom);
                      // setIsFocusEdit(true);
                      // }}
                      // onChangeText={(text) => {}}
                    />

                    <Text
                      style={[metaStyles.grayTextSmall66, { marginTop: 20 }]}
                    >
                      Total Supply:21000000
                    </Text>
                    {/* <TouchableWithoutFeedback onPress={() => {}}>
                  <Text
                    style={[
                      metaStyles.blueText,
                      { marginTop: 20, textAlign: "center" },
                    ]}
                  >
                    Show More Options
                  </Text>
                </TouchableWithoutFeedback> */}

                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 30,
                        justifyContent: "space-around",
                      }}
                    >
                      <TouchableWithoutFeedback
                        onPress={() => {
                          setIndexInscribe(false);
                          setOtherInscribe1(true);
                        }}
                      >
                        <View
                          style={[
                            {
                              flexDirection: "row",
                              height: 48,
                              width: "40%",
                              backgroundColor: "white",
                              borderRadius: 23,
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: 20,
                              borderColor: themeColor,
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <Text style={{ color: themeColor, fontSize: 16 }}>
                            Next
                          </Text>
                        </View>
                      </TouchableWithoutFeedback>

                      <View
                        style={[
                          {
                            flexDirection: "row",
                            height: 48,
                            width: "40%",
                            backgroundColor: themeColor,
                            borderRadius: 23,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>
                          Deploy
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* mint modal */}
                {isDeploy == false && (
                  <View>
                    <Text>Mint</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal transparent={true} visible={isOtherInscribe1}>
          <TouchableWithoutFeedback
            accessible={false}
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    Inscribe
                  </Text>
                  <View style={{ flex: 1 }} />

                  <TouchableWithoutFeedback
                    onPress={() => {
                      setOtherInscribe1(false);
                    }}
                  >
                    <Image
                      source={require("../../image/metalet_close_big_icon.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableWithoutFeedback>
                </View>

                {/* <ScrollView  keyboardShouldPersistTaps="handled" > */}
                <View style={{}}>
                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 30 }]}
                  >
                    Optional
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      Token Name
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Icon</Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Decimals</Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      Premine Count
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 30,
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setOtherInscribe1(false);
                        setOtherInscribe2(true);
                      }}
                    >
                      <View
                        style={[
                          {
                            flexDirection: "row",
                            height: 48,
                            width: "80%",
                            backgroundColor: themeColor,
                            borderRadius: 23,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>
                          Next
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                {/* </ScrollView> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal transparent={true} visible={isOtherInscribe2}>
          <TouchableWithoutFeedback
            accessible={false}
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    Inscribe
                  </Text>
                  <View style={{ flex: 1 }} />

                  <TouchableWithoutFeedback
                    onPress={() => {
                      setOtherInscribe1(false);
                    }}
                  >
                    <Image
                      source={require("../../image/metalet_close_big_icon.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableWithoutFeedback>
                </View>

                {/* <ScrollView  keyboardShouldPersistTaps="handled" > */}
                <View style={{}}>
                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 30 }]}
                  >
                    Optional
                  </Text>

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      Begin Height
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      End Height
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 30 }]}
                  >
                    PIN Payment Settings
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Pay To</Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      Pay Amount
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 30,
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setOtherInscribe2(false);
                        setOtherInscribe3(true);
                      }}
                    >
                      <View
                        style={[
                          {
                            flexDirection: "row",
                            height: 48,
                            width: "80%",
                            backgroundColor: themeColor,
                            borderRadius: 23,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>
                          Next
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                {/* </ScrollView> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal transparent={true} visible={isOtherInscribe3}>
          <TouchableWithoutFeedback
            accessible={false}
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    Inscribe
                  </Text>
                  <View style={{ flex: 1 }} />

                  <TouchableWithoutFeedback
                    onPress={() => {
                      setOtherInscribe1(false);
                    }}
                  >
                    <Image
                      source={require("../../image/metalet_close_big_icon.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableWithoutFeedback>
                </View>

                {/* <ScrollView  keyboardShouldPersistTaps="handled" > */}
                <View style={{}}>
                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 30 }]}
                  >
                    PoP Difficulty Settings
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Creator</Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Path</Text>
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>
                      Difficulty Level
                    </Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />

                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={[metaStyles.smallDefaultText]}>Count</Text>

                    <Image
                      source={require("../../image/web_notice_icon.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  </View>

                  <TextInput
                    style={{
                      backgroundColor: litterWhittleBgColor,
                      padding: 10,
                      borderRadius: 23,
                      overflow: "hidden",
                      height: 50,
                      marginTop: 10,
                    }}
                    numberOfLines={1}
                    // value={uriReady}
                    // onFocus={() => {
                    // setFeedModeType(feedModeCustom);
                    // setIsFocusEdit(true);
                    // }}
                    // onChangeText={(text) => {}}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 30,
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setOtherInscribe3(false);
                      }}
                    >
                      <View
                        style={[
                          {
                            flexDirection: "row",
                            height: 48,
                            width: "80%",
                            backgroundColor: themeColor,
                            borderRadius: 23,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>
                          Deploy
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                {/* </ScrollView> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal transparent={true} visible={isPostBuzz}>
          <TouchableWithoutFeedback
            accessible={false}
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderTopRightRadius: 10,
                  borderTopLeftRadius: 10,
                  paddingBottom: 40,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    New Buzz
                  </Text>
                  <View style={{ flex: 1 }} />

                  <TouchableWithoutFeedback
                    onPress={() => {
                      setPostBuzz(false);
                    }}
                  >
                    <Image
                      source={require("../../image/metalet_close_big_icon.png")}
                      style={{ width: 15, height: 15 }}
                    />
                  </TouchableWithoutFeedback>
                </View>

                <View style={{}}>
                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 30 }]}
                  >
                    Select Networks
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../image/logo_btc.png")}
                        style={{ width: 45, height: 45 }}
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 12 }}>Bitcoin</Text>
                      </View>

                      <View style={{ flex: 1 }} />

                      <Image
                        source={require("../../image/buzz_chain_select_icon.png")}
                        style={{ width: 16, height: 16 }}
                      />
                    </View>
                    <View
                      style={{
                        backgroundColor: inputNormalBgColor,
                        width: 0.5,
                        height: 20,
                        marginRight: 10,
                        marginLeft: 10,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        flex: 1.1,
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={require("../../image/logo_mvc.png")}
                        style={{ width: 45, height: 45 }}
                      />
                      <View
                        style={{ marginLeft: 10, justifyContent: "center" }}
                      >
                        <Text style={{ fontSize: 12 }}>Microvisonchain</Text>
                        {/* <Text style={{ marginTop: 10, fontSize: 14, color: "#666" }}>
                sdfewfwsf
              </Text> */}
                        <View style={{ marginLeft: 0 }}>
                          <View
                            style={{
                              marginTop: 3,
                              backgroundColor: "rgba(247, 147, 26, 0.2)",
                              borderRadius: 10,
                              alignItems: "center",
                              paddingVertical: 2,
                              paddingHorizontal: 5,
                            }}
                          >
                            <Text style={{ fontSize: 6, color: "#FF981C" }}>
                              Bitcoin sidechain{" "}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={{ flex: 1 }} />

                      <Image
                        source={require("../../image/buzz_chain_normal_icon.png")}
                        style={{ width: 16, height: 16 }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 30,
                      justifyContent: "space-around",
                    }}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setPostBuzz(false);
                      }}
                    >
                      <View
                        style={[
                          {
                            flexDirection: "row",
                            height: 48,
                            width: "80%",
                            backgroundColor: themeColor,
                            borderRadius: 23,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          },
                        ]}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>
                          Deploy
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>

                {/* buzz public */}

                <View>
                  <Text
                    style={[metaStyles.smallDefaultText, { marginTop: 10 }]}
                  >
                    Public
                  </Text>
                  <View>
                    <TextInput
                      placeholder={t("m_import_web_title")}
                      multiline={true}
                      numberOfLines={6}
                      style={[
                        metaStyles.textInputDefault,
                        {
                          paddingVertical: 20,
                          height: 135,
                          textAlignVertical: "top",
                        },
                      ]}
                      onChangeText={(text) => {
                        // setMneMonic(text.trim());
                        // setMneMonic(text);
                      }}
                    />
                  </View>
                </View>

                {/* </ScrollView> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
