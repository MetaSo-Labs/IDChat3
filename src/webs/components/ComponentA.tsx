import React from "react";
import { Text, View } from "react-native";

export default ({ children, ...params }) => {
  return (
    <View
      style={{
        marginBottom: 8,
      }}
    >
      {children ? children : null}
      {/* <Text>{JSON.stringify(params)}</Text> */}
    </View>
  );
};
