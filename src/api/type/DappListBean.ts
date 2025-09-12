export interface DappListBean {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

export interface Data {
  recommend: Recommend[];
  tops: Recommend[];
  dapps: null;
  classify: Classify;
}

export interface Classify {
  Bridge: Recommend[];
  MarketPlace: Recommend[];
  MetaSo: Recommend[];
  Tools: Recommend[];
}

export interface Recommend {
  name: string;
  icon: string;
  url: string;
  desc: string;
  recover: string;
  themeColor: string;
}