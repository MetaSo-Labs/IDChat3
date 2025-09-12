export interface RootBtcBalanceObject {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

export interface Data {
  balance: number;
  block: Block;
  mempool: Block;
  pendingBalance: number;
  safeBalance: number;
  inscriptionsBalance: number;
  runesBalance: number;
  pinsBalance: number;
}

interface Block {
  incomeFee: number;
  spendFee: number;
}