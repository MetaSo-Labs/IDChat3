export interface MvcNftData {
  code: number;
  message: string;
  processingTime: number;
  data: MvcNftListData;
}

export interface MvcNftListData {
  list: MvcNft[];
  seriesName: string;
  tokenSupply: number;
}

export interface MvcNft {
  address: string;
  txId: string;
  txIndex: number;
  codeHash: string;
  genesis: string;
  sensibleId: string;
  height: number;
  metaTxId: string;
  metaOutputIndex: number;
  tokenSupply: number;
  tokenIndex: number;
  satoshi: number;
  satoshiString: string;
  flag: string;
  name: string;
  icon: string;
  imgUrl: string;
  seriesName: string;
  issuerAddress: string;
  issuerName: string;
  issueTime: number;
}





export interface MvcNftListObject {
  codeHash: string;
  genesis: string;
  sensibleId: string;
  tokenSupply: string;
  count: string;
  metaTxid: string;
  metaOutputIndex: number;
  seriesName: string;
  nftList: MvcNftDetailData[];
}

export interface MvcNftDetailData {
  address: string;
  txId: string;
  txIndex: number;
  sensibleId: string;
  height: number;
  metaTxId: string;
  metaOutputIndex: number;
  tokenIndex: number;
  flag: string;
  name: string;
  icon: string;
  imgUrl: string;
  issuerAddress: string;
  issuerName: string;
  issueTime: number;
}



export interface MvcNftSerListData {
  list: MvcNftDetail[];
  seriesName: string;
  tokenSupply: number;
}

export interface MvcNftDetail {
  address: string;
  txId: string;
  txIndex: number;
  codeHash: string;
  genesis: string;
  sensibleId: string;
  height: number;
  metaTxId: string;
  metaOutputIndex: number;
  tokenSupply: number;
  tokenIndex: number;
  satoshi: number;
  satoshiString: string;
  flag: string;
  name: string;
  icon: string;
  imgUrl: string;
  seriesName: string;
  issuerAddress: string;
  issuerName: string;
  issueTime: number;
}