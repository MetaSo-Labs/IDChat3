export interface RootObject {
  code: number;
  data: Data;
}

interface Data {
  total: number;
  results: Results;
}

interface Results {
  info: Info;
  items: MvcFtBeans[];
}

export interface MvcFtBeans {
  codehash: string;
  genesis: string;
  genesisTxId: string;
  issueList: IssueList[];
  sensibleId: string;
  symbol: string;
  totalSupply: number;
  totalSupplyStr: string;
  balance: string;
  decimalNum: number;
  name: string;
  desc: string;
  icon: string;
  iconUrl: string;
  website: string;
  issuer: string;
  timestamp: number;
  issueVersion: string;
  imageError:boolean
}

interface IssueList {
  issueTxId: string;
}

interface Info {
  version: string;
  responseTime: string;
}