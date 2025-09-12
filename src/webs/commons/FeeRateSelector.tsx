import { useEffect, useState } from "react";
import CloseIcon from "@/components/icons/CloseIcon";
import { useBTCRateQuery } from "@/queries/transaction";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import SelectActiveIcon from "@/components/icons/SelectActiveIcon";
import { Text, View, TouchableOpacity, Modal, TextInput } from "react-native";

export default ({
  onChange,
  feeRate: initFeeRate,
}: {
  feeRate?: number;
  onChange: Function;
}) => {
  const [visible, setVisible] = useState(false);
  const [feeRate, setFeeRate] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const { isLoading, data: rateList } = useBTCRateQuery({ enabled: true });

  useEffect(() => {
    if (initFeeRate) {
      setSelectedIndex(-1);
      setFeeRate(initFeeRate);
    } else {
      setSelectedIndex(1);
    }
  }, []);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text>{feeRate} sat/vB</Text>
        <ChevronRightIcon
          style={{
            width: 56, // w-3.5 (56px)
            height: 56, // h-3.5 (56px)
            backgroundColor: "#000", // Just for illustration, if you need background color
          }}
        />
      </TouchableOpacity>
      <Modal animationType="fade" visible={visible} transparent={true}>
        <SafeAreaView
          style={{
            flex: 1,
            flexDirection: "column",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        >
          <View style={{ flex: 1 }}></View>
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                position: "relative",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16, // Tailwind 的 py-4 是 1rem，即 16px
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Select Fee Rate
              </Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{
                  position: "absolute",
                  right: 0,
                }}
              >
                <CloseIcon
                  style={{
                    color: "#000000", // 替代 text-black-primary，需根据实际定义确认
                    marginRight: 16, // mr-4 = 4 * 4 = 16
                    width: 12, // w-3 = 3 * 4 = 12
                    height: 12, // h-3 = 3 * 4 = 12
                  }}
                />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <Text
                style={{
                  textAlign: "center",
                  paddingVertical: 48, // 12 * 4 (Tailwind 的 spacing 单位是 4px)
                }}
              >
                Fee Rate Loading...
              </Text>
            ) : rateList && rateList.length ? (
              <View
                style={{
                  paddingHorizontal: 16, // px-4 = 4 * 4 = 16
                  paddingVertical: 16, // py-4 = 4 * 4 = 16
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                    columnGap: 8, // gap-x-2 = 2 * 4 = 8 (React Native 0.71+ 支持)
                  }}
                >
                  {rateList.map((rate, index) => (
                    <TouchableOpacity
                      key={rate.title}
                      onPress={() => {
                        onChange(rate.feeRate);
                        setSelectedIndex(index);
                        setFeeRate(rate.feeRate);
                      }}
                      style={[
                        {
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          borderRadius: 6, // rounded-md
                          aspectRatio: 1, // aspect-square
                          position: "relative",
                          rowGap: 4, // gap-y-1 = 4px
                        },
                        index === selectedIndex
                          ? { borderColor: "#007BFF" } // replace with your blue-primary hex
                          : { borderColor: "#E5E7EB" }, // replace with gray-soft hex
                        { borderWidth: 1 },
                      ]}
                    >
                      <Text style={{ fontSize: 12 }}>{rate.title}</Text>
                      <Text style={{ fontSize: 14 }}>
                        {rate.feeRate} sat/vB
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666666",
                          textAlign: "center",
                          paddingHorizontal: 8,
                        }}
                      >
                        {rate.desc}
                      </Text>
                      {index === selectedIndex && (
                        <SelectActiveIcon className="absolute -top-1 right-0 w-4 h-4" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedIndex(-1)}
                  style={[
                    {
                      borderColor: selectedIndex === -1 ? "#1E40AF" : "#D1D5DB", // 你可以替换为你项目中的颜色
                      borderWidth: 1,
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: "100%",
                      height: 64, // 16 * 4px = 64px
                      justifyContent: "center",
                      borderRadius: 8, // 对应rounded-md
                      position: "relative",
                      gap: 4, // 4px between items
                      paddingHorizontal: 16, // px-4 对应 16px
                    },
                  ]}
                >
                  <Text style={{ fontSize: 12 }}>Custom Fee Rate</Text>
                  <TextInput
                    style={{ fontSize: 14 }}
                    placeholder={"sat/vB"}
                    inputAccessoryViewID={"FeeRate"}
                    value={selectedIndex == -1 ? feeRate.toString() : ""}
                    onChangeText={(feeRate) => {
                      onChange(Number(feeRate));
                      setFeeRate(Number(feeRate));
                    }}
                  />
                  {-1 === selectedIndex && (
                    <SelectActiveIcon style={{
                      position: 'absolute', // 绝对定位
                      top: -4, // -top-1 (负4px)
                      right: 0, // right-0 (右对齐)
                      width: 16, // w-4 (16px)
                      height: 16, // h-4 (16px)
                    }}/>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={{
                backgroundColor: "#1e40af", // bg-blue-primary (自定义颜色)
                width: 246, // w-[246px]
                height: 48, // h-12 (48px)
                marginVertical: 16, // my-4 (16px top & bottom)
                borderRadius: 50, // rounded-full
                alignSelf: "center", // mx-auto (center horizontally)
                justifyContent: "center", // flex + justify-center
                alignItems: "center", // flex + items-center
                flexDirection: "row", // Ensure the flex direction is horizontal (row)
              }}
            >
              <Text
                style={{
                  color: "white",
                }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
