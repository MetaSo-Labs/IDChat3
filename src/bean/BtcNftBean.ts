export interface RootBtcNftObject {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

interface Data {
  list: BtcNftBean[];
  total: number;
}

export interface BtcNftBean {
  inscriptionId: string;
  inscriptionNumber: number;
  address: string;
  outputValue: number;
  preview: string;
  content: string;
  contentLength: number;
  contentType: string;
  contentBody: string;
  timestamp: number;
  genesisTransaction: string;
  location: string;
  output: string;
  offset: number;
  utxoHeight: number;
  utxoConfirmation: string;
  nftShowContent:string;
   
  //dev
  id:number

}