export interface MvcActivityRecord {
  flag: string;
  address: string;
  time: number;
  height: number;
  income: number;
  outcome: number;
  txid: string;
}


// btc record
export interface BtcRootRecord {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

export interface Data {
  page: string;
  limit: string;
  totalPage: string;
  transactionList: TransactionList[];
}

export interface TransactionList {
  txId: string;
  methodId: string;
  blockHash: string;
  height: string;
  transactionTime: string;
  from: string;
  to: string;
  amount: string;
  transactionSymbol: string;
  txFee: string;
}