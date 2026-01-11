//BTC mvc price
export interface AssertPrice {
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
  doge: number;
}


