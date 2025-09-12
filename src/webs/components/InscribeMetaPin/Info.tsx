import { Text, View, Image } from "react-native";
import FeeRateSelector from "../../commons/FeeRateSelector";
import { MetaidData } from "../../actions/lib/authorize/btc/inscribe";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

interface Params {
  data: {
    feeRate: number;
    metaidDataList: MetaidData[];
  };
}

interface MetaidComponentProps {
  children?: React.ReactNode;
  params: Params;
}

const Estimator = forwardRef(
  ({ params, children }: MetaidComponentProps, ref) => {
    const [feeRate, setFeeRate] = useState(params.data.feeRate);

    const [metaidDataObj, setMetaidDataObj] = useState<
      Record<string, MetaidData[]>
    >({});

    useEffect(() => {
      const metaidDataObj = params.data.metaidDataList
        .sort((a, b) =>
          a.contentType?.includes("image") && !b.contentType?.includes("image")
            ? -1
            : !a.contentType?.includes("image") &&
                b.contentType?.includes("image")
              ? 1
              : 0
        )
        .reduce((acc, { operation, ...rest }) => {
          (acc[operation] = acc[operation] || []).push({ operation, ...rest });
          return acc;
        }, {});

      setMetaidDataObj(metaidDataObj);
    }, [params.data.metaidDataList]);

    useImperativeHandle(ref, () => ({
      getEstimatedData: () => {
        params.data.feeRate = feeRate;
        return params;
      },
    }));

    const handleFeeRateChange = (newFeeRate) => {
      setFeeRate(newFeeRate);
    };

    return (
      <View style={{ marginBottom: 8 }}>
        {children ? children : null}
        {Object.values(metaidDataObj).map((metaidDataList, index) => (
          <View
            key={index}
            style={{
              flexDirection: "column", // flex-col
              alignItems: "center", // items-center
              gap: 8, // gap-y-2 (vertical gap of 8px between items)
            }}
          >
            <Text
              style={{
                width: "100%",
              }}
            >
              operation: {metaidDataList[0].operation}
            </Text>
            <View
              style={{
                flexDirection: "row", // flex-row
                flexWrap: "wrap", // flex-wrap
                alignItems: "flex-start", // items-start
                width: "100%", // w-full
              }}
            >
              {metaidDataList.map((metaidData, index) =>
                metaidData.body ? (
                  metaidData.contentType?.includes("image") ? (
                    <View
                      style={{
                        width: "33.33%", // w-1/3 (1/3 of the width)
                        padding: 4,
                      }}
                      key={index}
                    >
                      <Image
                        style={{
                          width: "100%", // full width
                          height: undefined, // maintain aspect ratio
                          aspectRatio: 1, // aspect-square
                          borderRadius: 8, // rounded-md
                          resizeMode: "cover", // object-cover
                        }}
                        source={{
                          uri: `data:image/jpeg;base64,${metaidData.body}`,
                        }}
                      />
                    </View>
                  ) : (
                    <Text key={index}style={{
                      fontSize: 14, // text-sm
                    }}>
                      {metaidData.body}
                    </Text>
                  )
                ) : null
              )}
            </View>
          </View>
        ))}
        <View>
          <FeeRateSelector feeRate={feeRate} onChange={handleFeeRateChange} />
        </View>
      </View>
    );
  }
);

export default Estimator;
