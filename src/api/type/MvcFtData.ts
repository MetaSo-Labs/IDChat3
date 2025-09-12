export interface MvcFtData {
  codeHash: string;
  genesis: string;
  name: string;
  symbol: string;
  decimal: number;
  sensibleId: string;
  utxoCount: number;
  confirmed: number;
  confirmedString: string;
  unconfirmed: number;
  unconfirmedString: string;
  //dev
  imageError:boolean
  assetPrice:string
}


export interface MvcFtRecordData {
  flag: string;
  address: string;
  codeHash: string;
  genesis: string;
  time: number;
  height: number;
  income: number;
  outcome: number;
  txid: string;
}