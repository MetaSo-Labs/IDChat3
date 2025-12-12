export type SpaceBalance = {
  // {"address": "1C2XjqoXHRegJNnmJqGDMt3rbAcrYLX4L9", "confirmed": 17190, "unconfirmed": 0}
  address: string;
  confirmed: number;
  unconfirmed: number;
};

export class ShowBalance {
  spaceBalance: string = '';
  spaceAssert: string = '';
  btcBalance: string = '';
  btcAssert: string = '';
  dogeBalance: string = '';
  dogeAssert: string = '';
  sumAssert: string = '';
  btcNa: string = '';
  btcSafeBalance: string = '';
}

//btc ft balance

export interface TokenBalance {
  availableBalance: string;
  overallBalance: string;
  ticker: string;
  transferableBalance: string;
  availableBalanceSafe: string;
  availableBalanceUnSafe: string;
}

export interface TokenTransfer {
  ticker: string;
  amount: string;
  inscriptionId: string;
  inscriptionNumber: number;
  timestamp: number;
}
export interface TokenInfo {
  totalSupply: string;
  totalMinted: string;
}

export interface AddressTokenSummary {
  tokenInfo: TokenInfo;
  tokenBalance: TokenBalance;
  historyList: TokenTransfer[];
  transferableList: TokenTransfer[];
}

export interface Brc20DetailData {
  code: number;
  message: string;
  processingTime: number;
  data: AddressTokenSummary;
}
