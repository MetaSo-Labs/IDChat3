export interface BtcTransferBean {
  // psbt: import('bitcoinjs-lib').Psbt;
  psbt: "";
  fee: number;
  txInputs: TxInput[];
  txOutputs: TxInput[];
  rawTx: string;
  cost: string;
}

export interface TxInput {
  address: string;
  value: number;
}

export interface Psbt {
  data: TransferData;
}

export interface TransferData {
  inputs: Input[];
  outputs: Output[];
  globalMap: GlobalMap;
}

export interface GlobalMap {
  unsignedTx: UnsignedTx;
}

export interface UnsignedTx {
}

export interface Output {
  unknownKeyVals: any[];
}

export interface Input {
  unknownKeyVals: any[];
  nonWitnessUtxo: NonWitnessUtxo;
  finalScriptSig: NonWitnessUtxo;
}

export interface NonWitnessUtxo {
  type: string;
  data: number[];
}