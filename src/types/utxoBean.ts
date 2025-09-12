export interface UtxoBean {
  code: number;
  message: string;
  processingTime: number;
  data: Utxo[];
}

export interface Utxo {
  confirmed: boolean;
  inscriptions: null;
  satoshi: number;
  txId: string;
  vout: number;
  outputIndex: number;
  satoshis: number;
}