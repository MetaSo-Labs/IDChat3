export interface FeedBtcObject {
  code: number;
  message: string;
  processingTime: number;
  data: FeedData;
}

export interface FeedData {
  list: FeedBean[];
}

export interface FeedBean {
  title: string;
  desc: string;
  feeRate: number;
}