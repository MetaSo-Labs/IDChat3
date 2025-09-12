export interface RootPriceObject {
  code: number;
  message: string;
  processingTime: number;
  data: Data;
}

interface Data {
  priceInfo: PriceInfo;
}

interface PriceInfo {
  btc: number;
  space: number;
}