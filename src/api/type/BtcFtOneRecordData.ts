export interface BtcFtOneRecordData {
  code: number;
  message: string;
  processingTime: number;
  data: RecordDataList;
}

export interface RecordDataList {
  page: string;
  limit: string;
  totalPage: string;
  totalTransaction: string;
  inscriptionsList: InscriptionsList[];
}

export interface InscriptionsList {
  txId: string;
  blockHeight: string;
  state: string;
  tokenType: string;
  actionType: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  token: string;
  inscriptionId: string;
  inscriptionNumber: string;
  index: string;
  location: string;
  msg: string;
  time: string;
}