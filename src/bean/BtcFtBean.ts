export interface RootBtcFtObject {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

interface Data {
  list: BtcFtBean[];
  total: number;
}

export interface BtcFtBean {
  ticker: string;
  overallBalance: string;
  transferableBalance: string;
  availableBalance: string;
  availableBalanceSafe: string;
  availableBalanceUnSafe: string;
  decimal: number;
  type: string;
}

export interface RootMrc20Data {
  code: number;
  message: string;
  processingTime: number;
  data: Mrc20List;
}

export interface Mrc20List {
  total: number;
  list: Mrc20Data[];
}

export interface Mrc20Data {
  tick: string;
  tokenName: string;
  mrc20Id: string;
  balance: string;
  amount: string;
  decimals: string;
  metaData: string;
  type: string;
  deployUserInfo: DeployUserInfo;
  //dev
  assetPrice: string;
}

export interface DeployUserInfo {
  name: string;
  avatar: string;
}
