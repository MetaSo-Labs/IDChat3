export interface PreInscribe {
  count: number;
  fee: number;
  inscriptionState: number;
  minerFee: number;
  needAmount: number;
  networkFeeRate: number;
  orderId: string;
  payAddress: string;
  payAmount: number;
  receiveAddress: string;
  serviceFee: number;
}

export interface PreInscribeData {
  code: number;
  data: PreInscribe;
  message: string;
  processingTime: number;
}



export interface InscribeResultData {
  code: number;
  message: string;
  processingTime: number;
  data: CommitInscribe;
}

export interface CommitInscribe {
  commitTxHash: string;
  inscriptionIdList: string[];
  inscriptionInfos: InscriptionInfo[];
  inscriptionState: number;
  orderId: string;
  revealTxHashList: string[];
}

export interface InscriptionInfo {
  confirmed: boolean;
  inscriptionId: string;
  inscriptionNum: number;
}