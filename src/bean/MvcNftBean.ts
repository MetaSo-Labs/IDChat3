export interface RootMvcNftObject {
  code: number;
  data: Data;
}

interface Data {
  cursor: string;
  status: string;
  total: number;
  shieldTotal: number;
  results: Results;
}

interface Results {
  info: Info;
  items: MvcGenesisItem[];
}

export interface MvcGenesisItem {
  nftChain: string;
  nftCodehash: string;
  nftGenesis: string;
  nftGenesisTxId: string;
  nftSensibleId: string;
  nftSymbol: string;
  nftMyCount: number;
  nftMyPendingCount: number;
  nftTotalSupply: number;
  nftSeriesName: string;
  nftName: string;
  nftDesc: string;
  nftIcon: string;
  nftWebsite: string;
  nftIssuer: string;
  nftIssueMetaId: string;
  nftIssueUserInfo: NftIssueUserInfo;
  nftIssueAvatarTxId: string;
  nftIssueAvatarType: string;
  nftTimestamp: number;
  nftIssueVersion: string;
  nftDataStr: string;
  nftDetailItemList: MvcNftDetailItemList[];
  nftGenesisType: string;
  nftHasCompound: boolean;
  nftIsReady: boolean;
}

export interface MvcNftDetailItemList {
  nftChain: string;
  nftSellContractTxId: string;
  nftSellTxId: string;
  nftCodehash: string;
  nftGenesis: string;
  nftGenesisTxId: string;
  nftSensibleId: string;
  nftSellDesc: string;
  nftSellState: number;
  nftSymbol: string;
  nftSeriesName: string;
  nftBalance: number;
  nftName: string;
  nftDesc: string;
  nftIcon: string;
  nftBackIcon: string;
  nftAttachment: string;
  nftAttachmentType: string;
  nftWebsite: string;
  nftClassifyList: string[];
  nftIssuer: string;
  nftPart: string;
  nftDNA: string;
  nftPartBase: string;
  nftTimestamp: number;
  nftTotalSupply: number;
  nftTokenIndex: string;
  nftTokenId: string;
  nftIssueVersion: string;
  nftIssueMetaTxId: string;
  nftIssueMetaId: string;
  nftIssueAddress: string;
  nftIssueUserInfo: NftIssueUserInfo;
  nftIssueAvatarTxId: string;
  nftIssueAvatarImage: string;
  nftIssueAvatarType: string;
  nftDataStr: string;
  nftOwnerAddress: string;
  nftOwnerMetaId: string;
  nftOwnerUserInfo?: any;
  nftOwnerName: string;
  nftOwnerAvatarTxId: string;
  nftOwnerAvatarImage: string;
  nftOwnerAvatarType: string;
  nftIsReady: boolean;
  nftPrice: number;
  nftSatoshi: number;
  nftCertificationType: number;
  nftGenesisCertificationType: number;
  nftGenesisCertificationName: string;
  nftCurrentAuctionCreateTxId: string;
  nftCurrentAuctionBidTxId: string;
  nftCurrentBidPrice: string;
  nftCurrentBidPriceInt: number;
  nftCurrentAuctionState: number;
  nftStartingPrice: string;
  nftStartingPriceInt: number;
  nftChargeUnit: string;
  nftEndTimeStamp: string;
  nftMinBidIncrease: string;
  nftMinBidIncreaseInt: number;
  nftLikeCount: number;
  nftDonateCount: number;
  nftDonateValue: number;
  nftHasLike: boolean;
  nftHasDonate: boolean;
  nftIsFirstSell: boolean;
  nftHasCompound: boolean;
  flag: string;
  nftIsLegal: boolean;
  nftLegalUuid: string;
  nftLegalPrice: number;
  nftSpecialLegalCnyPrice: number;
  nftLegalSymbol: string;
  nftCanSellTimestamp: number;
  nftIsOrderLock: boolean;
}

interface NftIssueUserInfo {
  name: string;
  metaName: string;
  nameType: string;
  nftNamePublicKey: string;
  avatarTxId: string;
  avatarImage: string;
  avatarType: string;
  infoAvatarTxIdOssUrl: string;
  address: string;
  publicKey: string;
  coverUrl: string;
  coverType: string;
  coverPublicKey: string;
  metaIdTimestamp: number;
}

interface Info {
  version: string;
  responseTime: string;
  responseCacheTime: string;
}