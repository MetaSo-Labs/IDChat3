import { BtcWallet, Chain, MvcWallet } from "@metalet/utxo-wallet-service";

interface Account {
  id: string;
  name: string;
  addressIndex: number;
}

export interface Wallet {
  id: string;
  name: string;
  mnemonic: string;
  mvcTypes: number; // FIXME: should be mvcType
  addressType: string;
  isBackUp: boolean;
  seed: string;
  accountsOptions: Account[];
}

export interface WalletMap {
  [Chain.BTC]: BtcWallet;
  [Chain.MVC]: MvcWallet;
}
