import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import PasswordPay from "react-native-password-pay";
import { SafeAreaView } from "react-native-safe-area-context";
import { WalletManager } from "@metalet/utxo-wallet-service";
import { QRScanner } from "../../constant/Widget";

export default function PasswordPage() {
  // walletManager 测试
  // useEffect(() => {
  //   console.log("PasswordPage");

  //   const t1 = performance.now();
  //   const walletManager = new WalletManager({
  //     network: "testnet",
  //     walletsOptions: [
  //       {
  //           id:'1111',
  //         mnemonic:
  //           "net turn first rare glide patient mask hungry damp cabbage umbrella ostrich",
  //         mvcTypes: [10001],
  //         accountsOptions: [{ addressIndex: 0 }],
  //       },
  //     ],
  //   });
  //   let wallets = walletManager.getWallets();
  //   console.log(wallets);
  //   const t2 = performance.now();
  //   console.log(t2 - t1);
  //   walletManager.addAccount('1111',{
  //     addressIndex: 1,
  //   });
  //    wallets = walletManager.getWallets();
  //   console.log(wallets);
  //   console.log(performance.now() - t2);
  // }, []);

  //密码测试
  // return (
  //   <SafeAreaView style={{ flex: 1 }}>
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <PasswordPay
  //         maxLength={6}
  //         onChange={(value) => {
  //           console.log("输入的密码：", value);
  //         }}
  //       ></PasswordPay>
  //     </View>
  //   </SafeAreaView>
  // );

  // 扫一扫测试
  return (
    <View style={{ flex: 1 }}>
      <QRScanner handleScan={(data)=>{
        console.log("扫码结果：", data);
      }}/>
    </View>
  );
}
