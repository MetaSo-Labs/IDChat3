export interface Mrc20RecordData {
  code: number;
  message: string;
  processingTime: number;
  data: Mrc20RecordDataList;
}

export interface Mrc20RecordDataList {
  total: number;
  list: Mrc20Record[];
}

export interface Mrc20Record {
  txId: string;
  tickId: string;
  tick: string;
  tokenName: string;
  decimals: string;
  metaData: string;
  from: string;
  to: string;
  amount: string;
  txType: number;
  timestamp: number;
}