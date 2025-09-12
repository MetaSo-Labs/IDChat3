export interface PINsBean {
  id: string;
  number: number;
  metaid: string;
  address: string;
  createAddress: string;
  creatorUserInfo: PINCreatorUserInfo;
  creator: string;
  avatar: string;
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
  mrc721File: string;
  mrc721FileUrl: string;
  status: number;
  preview: string;
  content: string;
  pop: string;
  popLv: number;
  chainName: string;
  //dev
  showImage:string
}

export interface PINCreatorUserInfo {
  name: string;
  avatar: string;
}