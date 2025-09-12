import { BtcHotWallet } from "@metalet/utxo-wallet-sdk";
import { BtcWallet, MvcWallet } from "@metalet/utxo-wallet-service";

class MetaletWallet {
  //当前钱包部分
  id: string;
  currentMvcWallet: MvcWallet;
  currentBtcWallet: BtcWallet;
   
  //cold Wallet
  currentBtcColdWallet: BtcHotWallet;
  currentMvcColdWallet: MvcWallet;


  //支持钱包
  btcLegacyWallet: BtcWallet; //1  84 86 49
  btcNativeSegwitWallet: BtcWallet;
  btcNestedSegwitWallet: BtcWallet;
  btcTaprootWallet: BtcWallet;
  btcSameAsWallet: BtcWallet;

  //当前钱包余额
  currentSumAssert: string="0.00";
  currentMvcBalance: string="0.00";
  currentBtcBalance: string="0.00";
  currentSpaceAssert: string="0.00";
  currentBtcAssert: string="0.00";
  currentBtcNa: string="0.00";
  currentBtcSafeBalance: string="0.00";

  currentMVCPrice: number=0;
  currentBtcPrice: number=0;
}

export default MetaletWallet;
