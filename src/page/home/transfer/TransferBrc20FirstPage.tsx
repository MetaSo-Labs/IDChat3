import {
  View,
  Text,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Title } from "react-native-paper";
import { Line, RoundSimButton, TitleBar } from "@/constant/Widget";
import {
  litterWhittleBgColor,
  metaStyles,
  themeColor,
} from "@/constant/Constants";
import { navigate } from "@/base/NavigationService";
import { useData } from "@/hooks/MyProvider";
import { Brc20DetailData, TokenTransfer } from "@/api/type/Balance";
import { fetchOneBrc20 } from "@/api/metaletservice";
import { getWalletNetwork } from "@/utils/WalletUtils";
import { Chain } from "@metalet/utxo-wallet-service";
import { useTranslation } from "react-i18next";

export default function TransferBrc20FirstPage({ route }) {
  const { brc20 } = route.params;
  const { btcAddress, updateBtcAddress } = useData();
  const [tokenTransferList, setTokenTransferList] = useState([]);
  const [tokenTransferListMore, setTokenTransferListMore] = useState([]);

  const [showAllTransfer, setShowAllTransfer] = useState(false);
  const [showAllTag, setShowAllTag] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    initData();
  }, []);

  async function initData() {
    const network = await getWalletNetwork(Chain.BTC);
    const brc20Balance: Brc20DetailData = await fetchOneBrc20(
      btcAddress,
      network,
      brc20.ticker
    );
    const tokeList: TokenTransfer[] = brc20Balance.data.transferableList;
    const toke2: TokenTransfer = {
      ticker: "rdex",
      amount: "2321",
      inscriptionId: "#3248",
      inscriptionNumber: 23,
      timestamp: 32,
    };

    if (tokeList.length > 0) {
      // tokeList.push(toke2);
      // tokeList.push(toke2);
      // tokeList.push(toke2);
      // tokeList.push(toke2);
      // tokeList.push(toke2);
      let tokeList1 = [];
      tokeList1.push(tokeList[0]);
      if (tokeList.length > 1) {
        tokeList1.push(tokeList[1]);
      }
      if (tokeList.length > 2) {
        setShowAllTag(true);
      }
      setTokenTransferList(tokeList1);
      setTokenTransferListMore(tokeList);
    }
    // setTokenTransferList(tokeList);
  }

  const EmptyView = () => {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../../../image/btc_brc20_empty_icon.png")}
          style={{ width: 45, height: 35, marginTop: 45 }}
          resizeMode="contain"
        />

        <Text
          style={[metaStyles.grayText99, { marginTop: 15, marginBottom: 20 }]}
        >
          Empty
        </Text>
      </View>
    );
  };

  function toTransfer(tokenTransfer) {
    navigate("TransferBrc20Page", { tokenTransfer: tokenTransfer });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Modal transparent={true} visible={showAllTransfer}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                Select Amount
              </Text>

              <View style={{ flex: 1 }} />

              <TouchableWithoutFeedback
                onPress={() => {
                  setShowAllTransfer(false);
                }}
              >
                <View style={{ width: 30, height: 30, alignItems: "center" }}>
                  <Image
                    source={require("../../../../image/metalet_close_big_icon.png")}
                    style={{ width: 15, height: 15 }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                numColumns={2}
                style={{ marginRight: 20 }}
                data={tokenTransferListMore}
                // columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        if (item.inscriptionNumber === -1) {
                          console.log("inscriptionNumber===-1");
                          return;
                        }
                        toTransfer(item);
                      }}
                    >
                      <View
                        style={{
                          marginTop: 20,
                          flex: 1,
                          marginLeft: 20,
                        }}
                      >
                        <View
                          style={{
                            paddingTop: 10,
                            width:
                              tokenTransferList.length <= 1 ? "45%" : "100%",
                            marginBottom: 20,
                            alignItems: "center",
                            backgroundColor: litterWhittleBgColor,
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={[
                              metaStyles.grayTextSmall66,
                              { marginTop: 20 },
                            ]}
                          >
                            {item.ticker.toUpperCase()}
                          </Text>

                          <Text
                            style={[
                              metaStyles.largeDefaultLittleText,
                              { marginTop: 15 },
                            ]}
                          >
                            {item.amount}
                          </Text>

                          {item.inscriptionNumber == -1 && (
                            <View
                              style={{
                                backgroundColor: "#FF8F1F",
                                width: "100%",
                                borderBottomEndRadius: 10,
                                borderBottomStartRadius: 10,
                                alignItems: "center",
                                paddingVertical: 8,
                                marginTop: 10,
                                flexDirection: "row",
                                justifyContent: "center",
                              }}
                            >
                              <ActivityIndicator
                                size={"small"}
                                color={"#fff"}
                              />
                              <Text style={{ color: "#fff", marginLeft: 5 }}>
                                Confirm
                              </Text>
                            </View>
                          )}

                          {item.inscriptionNumber != -1 && (
                            <View
                              style={{
                                backgroundColor: themeColor,
                                width: "100%",
                                borderBottomEndRadius: 10,
                                borderBottomStartRadius: 10,
                                alignItems: "center",
                                paddingVertical: 8,
                                marginTop: 10,
                              }}
                            >
                              <Text style={{ color: "#fff" }}>
                                # {item.inscriptionNumber}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                }}
              />
            </View>

            {/* <TouchableWithoutFeedback
              onPress={async () => {
                setShowAllTransfer(false);
              }}
            >
              <View
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  height: 20,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <View
                  style={[
                    {
                      flexDirection: "row",
                      height: 48,
                      width: "70%",
                      backgroundColor: themeColor,
                      borderRadius: 30,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { textAlign: "center" },
                      { color: "#fff" },
                      { fontSize: 16 },
                    ]}
                  >
                    Confirm
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback> */}
          </View>
        </View>
      </Modal>
      {/* Transfer */}
      <View style={{ flex: 1 }}>
        <TitleBar title={""} />
        <View style={{ marginHorizontal: 20, marginTop: 30 }}>
          <Text style={metaStyles.defaultText}>{t("c_amount")}</Text>
          <View style={[metaStyles.lineBgRadius, { padding: 10 }]}>
            <Text style={metaStyles.defaultText}>
              0 <Text> {brc20.ticker.toUpperCase()}</Text>
            </Text>

            <Line top={20} />

            <Text style={{ marginTop: 20, color: "#666" }}>
              {t("b_transfer_inscriptions")}
            </Text>

            {true &&
              (tokenTransferList.length > 0 ? (
                <View>
                  <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    numColumns={2}
                    // style={{ marginHorizontal: 20 }}
                    data={tokenTransferList}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item, index }) => {
                      return (
                        <TouchableWithoutFeedback
                          onPress={() => {
                            if (item.inscriptionNumber === -1) {
                              console.log("inscriptionNumber===-1");
                              return;
                            }
                            toTransfer(item);
                            // setShowAllTransfer(true);
                          }}
                        >
                          <View
                            style={{
                              marginTop: 20,
                              flex: 1,
                              marginLeft: index == 0 ? 0 : 20,
                            }}
                          >
                            <View
                              style={{
                                paddingTop: 10,
                                width:
                                  tokenTransferList.length <= 1
                                    ? "45%"
                                    : "100%",
                                marginBottom: 20,
                                alignItems: "center",
                                backgroundColor: litterWhittleBgColor,
                                borderRadius: 10,
                              }}
                            >
                              <Text
                                style={[
                                  metaStyles.grayTextSmall66,
                                  { marginTop: 20 },
                                ]}
                              >
                                {item.ticker.toUpperCase()}
                              </Text>

                              <Text
                                style={[
                                  metaStyles.largeDefaultLittleText,
                                  { marginTop: 15 },
                                ]}
                              >
                                {item.amount}
                              </Text>

                              {item.inscriptionNumber == -1 && (
                                <View
                                  style={{
                                    backgroundColor: "#FF8F1F",
                                    width: "100%",
                                    borderBottomEndRadius: 10,
                                    borderBottomStartRadius: 10,
                                    alignItems: "center",
                                    paddingVertical: 8,
                                    marginTop: 10,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                  }}
                                >
                                  <ActivityIndicator
                                    size={"small"}
                                    color={"#fff"}
                                  />
                                  <Text
                                    style={{ color: "#fff", marginLeft: 5 }}
                                  >
                                    Confirm
                                  </Text>
                                </View>
                              )}

                              {item.inscriptionNumber != -1 && (
                                <View
                                  style={{
                                    backgroundColor: themeColor,
                                    width: "100%",
                                    borderBottomEndRadius: 10,
                                    borderBottomStartRadius: 10,
                                    alignItems: "center",
                                    paddingVertical: 8,
                                    marginTop: 10,
                                  }}
                                >
                                  <Text style={{ color: "#fff" }}>
                                    # {item.inscriptionNumber}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      );
                    }}
                  />

                  {showAllTag && (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setShowAllTransfer(true);
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Text style={{ color: "#666", fontSize: 16 }}>All</Text>
                        <Image
                          source={require("../../../../image/wallets_close_icon.png")}
                          style={{ width: 10, height: 10, marginLeft: 5 }}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                </View>
              ) : (
                <EmptyView />
              ))}

            {/* 
            <View>
              <EmptyView />
            </View> */}
          </View>

          <Text style={[metaStyles.defaultText, { marginTop: 20 }]}>
            {t("b_inscribe_transfer")}
          </Text>
          <Text style={{ marginTop: 10, color: "#666", fontSize: 13 }}>
            {t("b_inscribe_transfer_notice")}
          </Text>

          <RoundSimButton
            title={
              t("b_available") +
              brc20.overallBalance +
              " " +
              brc20.ticker.toUpperCase()
            }
            event={() => {
              navigate("InscribeFirstPage", {
                brc20: brc20,
              });
            }}
            roundStytle={{ marginTop: 30 }}
            color="#F5F7F9"
            textColor="#666"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
