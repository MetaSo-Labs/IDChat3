import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { metaStyles } from "@/constant/Constants";
import { METALET_WALLET_PREFIX } from "@/queries/hosts";
import { navigate, navigatePush } from "@/base/NavigationService";
import { Recommend } from "@/api/type/DappListBean";
import { fetchDappList } from "@/api/metaletservice";

export default function DappsPage() {
  let [topList, setTopList] = useState<Recommend[]>();
  let [bridgeList, setBridgeList] = useState<Recommend[]>();
  let [marketList, setMarketList] = useState<Recommend[]>();
  let [metaSoList, setMetaSoList] = useState<Recommend[]>();
  let [toolsList, setToolsList] = useState<Recommend[]>();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const dappList = await fetchDappList();
    setTopList([...dappList.data.recommend]);
    setBridgeList([...dappList.data.classify.Bridge]);
    setMarketList([...dappList.data.classify.MarketPlace]);
    setMetaSoList([...dappList.data.classify.MetaSo]);
    setToolsList([...dappList.data.classify.Tools]);
    // console.log("DappsPage dappList: ", JSON.stringify(dappList));
  }
  const ListItem = ({ index, item }) => {
    return (
      <TouchableWithoutFeedback
        style={{
          flexDirection: "row", // flex-row
          alignItems: "center", // items-center
          gap: 8, // gap-x-2 → 2 * 4 = 8 (horizontal spacing between child elements)
          width: "100%", // w-full
          marginTop: 20,
        }}
        onPress={() => {
          navigatePush("WebsPage", {
            url: item.url,
            icon: `${METALET_WALLET_PREFIX}${item.icon}`,
          });
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 13,
          }}
        >
          <Image
            style={{
              width: 48, // w-12 → 12 * 4 = 48 (单位：像素)
              height: 48, // h-12 → 12 * 4 = 48 (单位：像素)
              borderRadius: 16, // rounded-2xl → 2 * 8 = 16 (单位：像素)
            }}
            source={{
              uri: `${METALET_WALLET_PREFIX}${item.icon}`,
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
              {item.name}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: "#666666", // text-[#666666]：指定文字颜色为 #666666
                fontSize: 12, // text-xs：小号字体，通常是12px
                width: "100%", // w-full：宽度占满父容器
              }}
            >
              {item.desc}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flex: 1,
          marginTop: 20,
          marginHorizontal: 20,
          marginBottom: 5,
          backgroundColor: "#fff",
        }}
      >
        <Text style={[{ textAlign: "left" }, metaStyles.titleText]}>DApp</Text>
        <Text style={{ fontWeight: "bold", marginTop: 20 }}>Recommended</Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 10,
            gap: 10,
          }}
        >
          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => {
              navigate("WebsPage", {
                url: topList?.[0]?.url,
              });
            }}
          >
            <View style={{ flex: 1 }}>
              <Image
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 16,
                }}
                source={{
                  uri: `${METALET_WALLET_PREFIX}${topList?.[0]?.recover}`,
                }}
              />
              <View
                style={{
                  backgroundColor: "#0F0503",
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
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {topList?.[0]?.name}
                  </Text>
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {topList?.[0]?.desc}
                  </Text>
                </View>

                {/* <Image
                style={{
                  width: 30, // w-12 → 12 * 4 = 48
                  height: 30, // h-12 → 48
                  borderRadius: 12, // rounded-xl ≈ 12
                  marginTop: -24, // -mt-6 → -6 * 4 = -24
                }}
                source={{
                  //   uri: `${METALET_WALLET_PREFIX}${recommend.icon}`,
                  uri: "https://www.metalet.space/wallet-api/v3/dapp/icon/icon-orders-exchange.png",
                }}
              /> */}
              </View>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={() => {
              navigate("WebsPage", {
                url: topList?.[1]?.url,
              });
            }}
          >
            <View style={{ flex: 1 }}>
              <Image
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  borderRadius: 16,
                }}
                source={{
                  uri: `${METALET_WALLET_PREFIX}${topList?.[1]?.recover}`,
                }}
              />
              <View
                style={{
                  backgroundColor: "#382EA8",
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
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {topList?.[1]?.name}
                  </Text>
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {topList?.[1]?.desc}
                  </Text>
                </View>
                {/* <Image
                source={{
                  uri: `${METALET_WALLET_PREFIX}${"/v3/dapp/icon/recover-octopus.png"}`,
                }}
              /> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <ScrollView
          style={{
            marginTop: 20,
            flex: 1, // flex-1
            width: "100%", // w-full
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", marginTop: 3 }}>
              Marketplace
            </Text>
            <FlatList
              scrollEnabled={false}
              data={marketList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 3 }}
            />

            <Text style={{ fontWeight: "bold", marginTop: 15 }}>Bridge</Text>
            <FlatList
              scrollEnabled={false}
              data={bridgeList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 3 }}
            />

            <Text style={{ fontWeight: "bold", marginTop: 15 }}>MetaSo</Text>
            <FlatList
              scrollEnabled={false}
              data={metaSoList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 3 }}
            />

            <Text style={{ fontWeight: "bold", marginTop: 15 }}>Tools</Text>
            <FlatList
              scrollEnabled={false}
              data={toolsList}
              renderItem={ListItem}
              keyExtractor={(item, index) => item.name}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 3 }}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
