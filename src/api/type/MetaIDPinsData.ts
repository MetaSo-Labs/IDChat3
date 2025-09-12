export interface MetaIDPinsData {
  code: number;
  message: string;
  processingTime: number;
  data: Pins[];
}

export interface Pins {
  id: string;
  number: number;
  metaid: string;
  address: string;
  createAddress: string;
  output: string;
  outputValue: number;
  timestamp: number;
  genesisFee: number;
  genesisHeight: number;
  genesisTransaction: string;
  txIndex: number;
  txInIndex: number;
  offset: number;
  location: string;
  operation: string;
  path: string;
  parentPath: string;
  originalPath: string;
  encryption: string;
  version: string;
  contentType: string;
  contentTypeDetect: string;
  contentBody: string;
  contentLength: number;
  contentSummary: string;
  status: number;
  preview: string;
  content: string;
  pop: string;
  popLv: number;
}