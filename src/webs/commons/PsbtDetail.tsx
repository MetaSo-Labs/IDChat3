import { Psbt } from "bitcoinjs-lib";
import { useState, useEffect } from "react";
import { getBtcNetwork } from "@/lib/network";
import { SafeAreaView } from "react-native-safe-area-context";
import ChevronLeftIcon from "@/components/icons/ChevronLeftIcon";
import { prettifyAddress, prettifyBalance } from "@/lib/formatters";
import ChevronDoubleRightIcon from "@/components/icons/ChevronDoubleRightIcon";
import { Text, View, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  Transaction,
  getAddressFromScript,
} from "@metalet/utxo-wallet-service";

export default ({ psbtHex, symbol, visible, close }) => {
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);

  useEffect(() => {
    if (psbtHex) {
      const network = getBtcNetwork();

      const psbt = Psbt.fromHex(psbtHex, { network });
      const inputs = psbt.data.inputs.map((inputData, index) => {
        let value = 0;
        let address = "";
        if (inputData?.witnessUtxo?.script) {
          // TODO: fix this
          address = getAddressFromScript(inputData.witnessUtxo.script, network);
        }
        if (inputData?.nonWitnessUtxo) {
          const tx = Transaction.fromBuffer(inputData.nonWitnessUtxo);
          const output = tx.outs[psbt.txInputs[index].index];
          address = getAddressFromScript(output.script, network);
          value = output.value;
        }
        return { address, value };
      });
      setInputs(inputs);

      const outputs = psbt.txOutputs.map((out) => ({
        value: out.value,
        address: out.address || "",
      }));
      setOutputs(outputs);
    }
  }, [psbtHex]);

  return (
    <Modal animationType="slide" visible={visible}>
      <SafeAreaView style={{ padding: 16 }}>
        <View
          style={{
            position: "relative", // relative
            height: 32, // h-8 (32px)
            width: "100%", // w-full (100% width)
            flexDirection: "row", // flex-row (horizontal layout)
            justifyContent: "center", // justify-center (horizontal centering)
            alignItems: "center", // items-center (vertical centering)
          }}
        >
          <TouchableOpacity
            onPress={close}
            style={{
              position: "absolute", // absolute
              left: 0, // left-0
              padding: 12, // p-3 (12px)
              borderRadius: 50, // rounded-full (圆形边框)
              flexDirection: "row", // flex (启用弹性布局)
              justifyContent: "center", // justify-center (水平居中)
              alignItems: "center", // items-center (垂直居中)
              elevation: 5, // shadow (适用于 Android)
              shadowColor: "#000", // 阴影的颜色（iOS）
              shadowOffset: { width: 0, height: 2 }, // 阴影偏移（iOS）
              shadowOpacity: 0.2, // 阴影透明度（iOS）
              shadowRadius: 3, // 阴影的模糊半径（iOS）
            }}
          >
            <ChevronLeftIcon
              style={{
                width: 14, // w-3.5 (14px)
                height: 14, // h-3.5 (14px)
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "center", // text-center (水平居中)
              lineHeight: 32, // leading-8 (行高为32px)
            }}
          >
            Transaction Details
          </Text>
        </View>

        <ScrollView>
          <View
            style={{
              flexDirection: "row", // flex-row (水平方向排列)
              justifyContent: "center", // justify-center (水平居中)
              alignItems: "center", // items-center (垂直居中)
              width: "100%", // w-full (宽度100%)
              padding: 8, // p-2 (内边距8px)
            }}
          >
            <View
              style={{
                flex: 1, // flex-1 (占满剩余空间)
                backgroundColor: "#E0F7FA", // bg-sky-50 (浅蓝色背景)
                borderWidth: 2, // border-2 (边框宽度为2px)
                borderColor: "#81D4FA", // border-sky-300 (较深的蓝色边框)
                borderStyle: "dashed", // border-dashed (虚线边框)
                paddingVertical: 8, // py-2 (上下内边距为8px)
                paddingHorizontal: 4, // px-1 (左右内边距为4px)
                borderRadius: 8, // rounded-lg (较大圆角)
              }}
            >
              <Text
                style={{
                  textAlign: "center", // text-center (水平居中)
                  fontSize: 14, // text-sm (字体大小为14px)
                  color: "#0c4a6e",
                }}
              >
                Inputs
              </Text>
              <View style={{ marginTop: 8 }}>
                {inputs.map((input, index) => (
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#81D4FA",
                      backgroundColor: "#81D4FA",
                      borderRadius: 8,
                      padding: 4,
                      marginBottom: 8,
                    }}
                    key={index}
                  >
                    <Text>Address</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                      }}
                    >
                      {prettifyAddress(input.address, 4)}
                    </Text>
                    <Text style={{ marginTop: 8 }}>Amount</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        flexWrap: "wrap",
                      }}
                    >
                      {prettifyBalance(input.amount, symbol)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <ChevronDoubleRightIcon
              style={{
                width: 14, // w-3.5 (3.5 * 4px = 14px)
                height: 14, // h-3.5 (3.5 * 4px = 14px)
                backgroundColor: "#000", // text-black-primary (Assumed black color)
                borderRadius: 7, // Making it circular
                justifyContent: "center",
                alignItems: "center",
              }}
            />

            <View
              style={{
                backgroundColor: "#E0F7FA", // bg-sky-50 (light sky color)
                borderWidth: 2,
                borderColor: "#4DB6AC", // border-teal-300 (teal color)
                borderStyle: "dashed",
                paddingVertical: 8, // py-2 (vertical padding 8px)
                paddingHorizontal: 4, // px-1 (horizontal padding 4px)
                borderRadius: 8, // rounded-lg (large rounded corners)
                width: "100%", // flex-1 (take up full available width)
              }}
            >
              <Text
                style={{
                  textAlign: "center", // text-center
                  fontSize: 14, // text-sm
                  color: "#00695C", // text-teal-900 (teal color)
                }}
              >
                Outputs
              </Text>
              <View style={{ marginTop: 8 }}>
                {outputs.map((output, index) => (
                  <View
                    style={{
                      borderWidth: 2, // border-2
                      borderColor: "#4DB6AC", // border-teal-300 (teal color)
                      backgroundColor: "#B2DFDB", // bg-teal-100 (light teal color)
                      borderRadius: 8, // rounded
                      padding: 4, // p-1 (padding 4px)
                      marginBottom: 8, // space-y-2 (vertical space between elements)
                    }}
                    key={index}
                  >
                    <Text>Address</Text>
                    <Text
                      style={{
                        fontSize: 12, // text-xs
                        color: "#6B7280", // text-gray-500 (gray color)
                      }}
                    >
                      {prettifyAddress(output.address, 4)}
                    </Text>
                    <Text style={{ marginTop: 8 }}>Amount</Text>
                    <Text
                      style={{
                        fontSize: 12, // text-xs
                        color: "#6B7280", // text-gray-500 (gray color)
                        flexWrap: "wrap", // break (word wrapping behavior)
                      }}
                    >
                      {prettifyBalance(output.amount, symbol)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
